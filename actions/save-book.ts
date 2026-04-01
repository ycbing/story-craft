"use server";

import { db } from "@/lib/db";
import { books, pages, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface SaveBookParams {
  bookId?: string;
  title: string;
  stylePrompt?: string;
  mainCharacterDesc?: string;
  pagesData: {
    pageNumber: number;
    aiText: string;
    aiImageUrl: string | null;
    canvasJson: Record<string, unknown> | null;
    outlineSummary?: string;
  }[];
  status?: "draft" | "completed";
}

export async function saveBookAction(params: SaveBookParams) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "未登录" };
  }

  try {
    // 1. 确保用户存在
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser.length) {
      await db.insert(users).values({
        id: userId,
        email: "",
        credits: 5,
      });
      console.log(`创建新用户: ${userId}`);
    }

    console.log(`正在保存绘本: ${params.title}, 页数: ${params.pagesData.length}`);

    let currentBookId = params.bookId;

    if (!currentBookId) {
      // 新建绘本
      const inserted = await db
        .insert(books)
        .values({
          userId,
          title: params.title,
          stylePrompt: params.stylePrompt || null,
          mainCharacterDesc: params.mainCharacterDesc || null,
          status: params.status || "draft",
        })
        .returning({ id: books.id });

      currentBookId = inserted[0]?.id;
      if (!currentBookId) {
        throw new Error("创建绘本失败");
      }
    } else {
      // 更新绘本
      const existingBook = await db
        .select({ userId: books.userId })
        .from(books)
        .where(eq(books.id, currentBookId))
        .limit(1);

      if (!existingBook.length || existingBook[0].userId !== userId) {
        throw new Error("无权修改此绘本");
      }

      await db.update(books)
        .set({
          title: params.title,
          stylePrompt: params.stylePrompt || null,
          mainCharacterDesc: params.mainCharacterDesc || null,
          status: params.status || "draft",
          updatedAt: new Date(),
        })
        .where(eq(books.id, currentBookId));

      await db.delete(pages).where(eq(pages.bookId, currentBookId));
    }

    // 批量插入页面
    if (params.pagesData.length > 0) {
      await db.insert(pages).values(
        params.pagesData.map((p) => ({
          bookId: currentBookId!,
          pageNumber: p.pageNumber,
          prompt: p.outlineSummary || "",
          aiText: p.aiText,
          aiImageUrl: p.aiImageUrl,
          canvasState: p.canvasJson ? JSON.stringify(p.canvasJson) : null,
        })),
      );
    }

    return { success: true, bookId: currentBookId };
  } catch (error) {
    console.error("保存失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "数据库写入失败",
    };
  }
}
