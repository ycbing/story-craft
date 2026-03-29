"use server";

import { db } from "@/lib/db";
import { books, pages, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/mock-auth";

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
  const user = currentUser;
  const userId = user.id;
  const userEmail = user.email;

  // better-sqlite3 的 db.transaction 是同步的，不能在 async 上下文中直接用
  // 改为手动顺序执行
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
        email: userEmail,
        credits: 5,
      });
      console.log(`创建新用户: ${userEmail}`);
    }

    console.log(`正在保存绘本: ${params.title}, 页数: ${params.pagesData.length}`);

    // 2. 使用同步 transaction（better-sqlite3 特性）
    const result = db.transaction((tx) => {
      // 注意：tx 里的操作是同步的
      let currentBookId = params.bookId;

      if (!currentBookId) {
        const inserted = tx
          .insert(books)
          .values({
            userId,
            title: params.title,
            stylePrompt: params.stylePrompt || null,
            mainCharacterDesc: params.mainCharacterDesc || null,
            status: params.status || "draft",
          })
          .returning({ id: books.id })
          .all();

        currentBookId = inserted[0]?.id;
        if (!currentBookId) {
          throw new Error("创建绘本失败");
        }
      } else {
        const existingBook = tx
          .select({ userId: books.userId })
          .from(books)
          .where(eq(books.id, currentBookId))
          .limit(1)
          .all();

        if (!existingBook.length || existingBook[0].userId !== userId) {
          throw new Error("无权修改此绘本");
        }

        tx.update(books)
          .set({
            title: params.title,
            stylePrompt: params.stylePrompt || null,
            mainCharacterDesc: params.mainCharacterDesc || null,
            status: params.status || "draft",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(books.id, currentBookId))
          .run();

        tx.delete(pages).where(eq(pages.bookId, currentBookId)).run();
      }

      if (params.pagesData.length > 0) {
        tx.insert(pages).values(
          params.pagesData.map((p) => ({
            bookId: currentBookId!,
            pageNumber: p.pageNumber,
            prompt: p.outlineSummary || "",
            aiText: p.aiText,
            aiImageUrl: p.aiImageUrl,
            canvasState: p.canvasJson ? JSON.stringify(p.canvasJson) : null,
          })),
        ).run();
      }

      return { bookId: currentBookId };
    });

    return { success: true, bookId: result.bookId };
  } catch (error) {
    console.error("保存失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "数据库写入失败",
    };
  }
}
