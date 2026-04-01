"use server";

import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export interface ExportPdfParams {
  bookId: string;
  includeCover?: boolean;
}

export async function exportPdfAction({
  bookId,
  includeCover = false,
}: ExportPdfParams) {
  "use server";

  console.log(`正在导出绘本 PDF: ${bookId}`);

  try {
    // 1. 获取书籍
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, error: "未找到该绘本" };
    }

    // 2. 获取页面
    const pagesData = await db
      .select()
      .from(pages)
      .where(eq(pages.bookId, bookId))
      .orderBy(asc(pages.pageNumber));

    // 3. 验证所有页面是否都已生成
    const incompletePages = pagesData.filter(
      (p) => !p.aiImageUrl || !p.canvasState
    );
    if (incompletePages.length > 0) {
      return {
        success: false,
        error: `还有 ${incompletePages.length} 页未完成，请完成后再导出`,
      };
    }

    return {
      success: true,
      data: {
        bookId: book.id,
        title: book.title,
        pages: pagesData.map((p) => ({
          pageNumber: p.pageNumber,
          aiText: p.aiText,
          canvasState: p.canvasState,
        })),
      },
    };
  } catch (error) {
    console.error("PDF 导出失败:", error);
    return { success: false, error: "导出失败，请重试" };
  }
}
