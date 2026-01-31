"use server";

import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 定义前端传来的数据结构
export interface SaveBookParams {
  bookId?: string; // 如果有 ID 说明是更新，没有说明是新建
  title: string;
  stylePrompt?: string; // 艺术风格
  mainCharacterDesc?: string; // 主角描述
  pagesData: {
    pageNumber: number;
    aiText: string;
    aiImageUrl: string | null;
    canvasJson: Record<string, unknown> | null;
    outlineSummary?: string;
  }[];
  status?: "draft" | "completed"; // 绘本状态
}

export async function saveBookAction(params: SaveBookParams) {
  // 1. 权限检查 (如果没有 Clerk，暂时硬编码一个 userId)
  // const { userId } = auth();
  const userId = "user_2bXyZ_test"; // ⚠️ 测试阶段先写死一个 ID

  if (!userId) return { success: false, error: "未登录" };

  console.log(
    `正在保存绘本: ${params.title}, 页数: ${params.pagesData.length}`,
  );

  try {
    // 开启事务：这是处理多表关联的最佳实践
    const result = await db.transaction(async (tx) => {
      let currentBookId = params.bookId;

      // --- A. 处理 Book 表 ---
      if (!currentBookId) {
        // 1. 如果没有 ID，创建新书
        const [newBook] = await tx
          .insert(books)
          .values({
            userId: userId,
            title: params.title,
            stylePrompt: params.stylePrompt,
            mainCharacterDesc: params.mainCharacterDesc,
            status: params.status || "draft",
          })
          .returning({ id: books.id }); // 拿到新生成的 UUID

        currentBookId = newBook.id;
      } else {
        // 2. 如果有 ID，更新标题和时间
        await tx
          .update(books)
          .set({
            title: params.title,
            stylePrompt: params.stylePrompt,
            mainCharacterDesc: params.mainCharacterDesc,
            status: params.status || "draft",
            updatedAt: new Date(),
          })
          .where(eq(books.id, currentBookId));
      }

      // --- B. 处理 Pages 表 ---
      // 简单粗暴策略：为了保证数据一致性，先删除旧的所有页，再插入新的所有页
      // (对于 MVP 来说这是最稳妥的，不用处理复杂的 Diff 逻辑)

      if (params.bookId) {
        await tx.delete(pages).where(eq(pages.bookId, currentBookId));
      }

      // 批量插入新页
      if (params.pagesData.length > 0) {
        await tx.insert(pages).values(
          params.pagesData.map((p) => ({
            bookId: currentBookId!, // 确保不为空
            pageNumber: p.pageNumber,
            prompt: p.outlineSummary || "", // 存储原始摘要
            aiText: p.aiText,
            aiImageUrl: p.aiImageUrl,
            canvasState: p.canvasJson, // 存入 Postgres 的 jsonb 字段
          })),
        );
      }

      return { bookId: currentBookId };
    });

    return { success: true, bookId: result.bookId };
  } catch (error) {
    console.error("保存失败:", error);
    return { success: false, error: "数据库写入失败" };
  }
}
