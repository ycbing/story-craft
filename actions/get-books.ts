"use server";

import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// 测试用户 ID（后续会替换为真实的认证用户 ID）
const TEST_USER_ID = "user_2bXyZ_test";

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
      .where(eq(books.userId, TEST_USER_ID))
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
    // 删除绘本（由于有 cascade 设置，页面会自动删除）
    await db.delete(books).where(eq(books.id, bookId));

    return { success: true };
  } catch (error) {
    console.error("删除绘本失败:", error);
    return { success: false, error: "删除绘本失败" };
  }
}
