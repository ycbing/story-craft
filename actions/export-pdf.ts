"use server";

import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 定义输入参数类型
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
    // 1. 从数据库获取书籍数据
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        pages: {
          orderBy: (pages, { asc }) => [asc(pages.pageNumber)],
        },
      },
    });

    if (!book) {
      return { success: false, error: "未找到该绘本" };
    }

    // 2. 验证所有页面是否都已生成
    const incompletePages = book.pages.filter(
      (p) => !p.aiImageUrl || !p.canvasState
    );
    if (incompletePages.length > 0) {
      return {
        success: false,
        error: `还有 ${incompletePages.length} 页未完成，请完成后再导出`,
      };
    }

    // 3. 返回所有需要的数据，让客户端生成 PDF
    // 注意：实际 PDF 生成在客户端进行，因为 canvas.toDataURL() 需要在浏览器环境
    return {
      success: true,
      data: {
        bookId: book.id,
        title: book.title,
        pages: book.pages.map((p) => ({
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
