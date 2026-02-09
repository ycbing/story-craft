import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    // 验证用户登录
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { bookId } = await params;

    // 获取绘本信息
    const bookData = await db
      .select({
        id: books.id,
        title: books.title,
        status: books.status,
        stylePrompt: books.stylePrompt,
        mainCharacterDesc: books.mainCharacterDesc,
        userId: books.userId,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookData.length) {
      return NextResponse.json({ error: "绘本不存在" }, { status: 404 });
    }

    const book = bookData[0];

    // 验证权限
    if (book.userId !== user.id) {
      return NextResponse.json({ error: "无权访问此绘本" }, { status: 403 });
    }

    // 获取绘本的所有页面
    const pagesData = await db
      .select({
        pageNumber: pages.pageNumber,
        aiText: pages.aiText,
        aiImageUrl: pages.aiImageUrl,
      })
      .from(pages)
      .where(eq(pages.bookId, bookId))
      .orderBy(pages.pageNumber);

    return NextResponse.json({
      id: book.id,
      title: book.title,
      status: book.status,
      stylePrompt: book.stylePrompt,
      mainCharacterDesc: book.mainCharacterDesc,
      pages: pagesData,
    });
  } catch (error) {
    console.error("获取绘本失败:", error);
    return NextResponse.json(
      { error: "获取绘本失败" },
      { status: 500 }
    );
  }
}
