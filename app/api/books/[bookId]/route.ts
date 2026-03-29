import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@/lib/mock-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = currentUser;

    const { bookId } = await params;

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

    if (book.userId !== user.id) {
      return NextResponse.json({ error: "无权访问此绘本" }, { status: 403 });
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = currentUser;
    const { bookId } = await params;

    // 验证书籍存在且属于当前用户
    const bookData = await db
      .select({ id: books.id, userId: books.userId })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookData.length) {
      return NextResponse.json({ error: "绘本不存在" }, { status: 404 });
    }

    if (bookData[0].userId !== user.id) {
      return NextResponse.json({ error: "无权删除此绘本" }, { status: 403 });
    }

    // 删除绘本（pages 会因为 CASCADE 自动删除）
    await db.delete(books).where(eq(books.id, bookId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除绘本失败:", error);
    return NextResponse.json(
      { error: "删除绘本失败" },
      { status: 500 }
    );
  }
}
