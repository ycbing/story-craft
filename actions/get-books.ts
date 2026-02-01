"use server";

import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface BookListItem {
  id: string;
  title: string;
  status: "draft" | "completed";
  coverUrl: string | null;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
  stylePrompt: string | null;
  mainCharacterDesc: string | null;
}

export async function getBooksAction() {
  try {
    // 获取当前登录用户 ID
    const authResult = auth();
    const userId = authResult?.userId;
    if (!userId) {
      return { success: false, error: "未登录", data: [] };
    }

    // 获取用户的所有绘本
    const userBooks = await db
      .select({
        id: books.id,
        title: books.title,
        status: books.status,
        coverUrl: books.coverUrl,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        stylePrompt: books.stylePrompt,
        mainCharacterDesc: books.mainCharacterDesc,
      })
      .from(books)
      .where(eq(books.userId, userId))
      .orderBy(desc(books.updatedAt));

    // 获取每本书的页面数量
    const booksWithPageCount = await Promise.all(
      userBooks.map(async (book) => {
        const pagesCount = await db
          .select({ count: pages.id })
          .from(pages)
          .where(eq(pages.bookId, book.id));

        return {
          ...book,
          pageCount: pagesCount.length || 0,
        } as BookListItem;
      })
    );

    return { success: true, data: booksWithPageCount };
  } catch (error) {
    console.error("获取绘本列表失败:", error);
    return { success: false, error: "获取绘本列表失败", data: [] };
  }
}

export async function deleteBookAction(bookId: string) {
  try {
    // 获取当前登录用户 ID
    const authResult = auth();
    const userId = authResult?.userId;
    if (!userId) {
      return { success: false, error: "未登录" };
    }

    // 先验证绘本是否属于当前用户
    const book = await db
      .select({ userId: books.userId })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length || book[0].userId !== userId) {
      return { success: false, error: "无权删除此绘本" };
    }

    // 删除绘本（由于有 cascade 设置，页面会自动删除）
    await db.delete(books).where(eq(books.id, bookId));

    return { success: true };
  } catch (error) {
    console.error("删除绘本失败:", error);
    return { success: false, error: "删除绘本失败" };
  }
}
