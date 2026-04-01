import Link from "next/link";
import { db } from "@/lib/db";
import { books, pages } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer as FooterSection } from "@/components/landing";
import { BookCardGrid } from "@/components/book-card-grid";
import { EmptyBooks } from "@/components/empty-books";
import { Header } from "@/components/landing/header";

export const dynamic = "force-dynamic";

interface BookItem {
  id: string;
  title: string;
  status: string | null;
  coverUrl: string | null;
  createdAt: string | null;
  stylePrompt: string | null;
  pageCount: number;
}

async function getRecentBooks(userId: string | null): Promise<BookItem[]> {
  if (!userId) return [];

  const userBooks = await db
    .select({
      id: books.id,
      title: books.title,
      status: books.status,
      coverUrl: books.coverUrl,
      createdAt: books.createdAt,
      stylePrompt: books.stylePrompt,
    })
    .from(books)
    .where(eq(books.userId, userId))
    .orderBy(desc(books.updatedAt))
    .limit(12);

  const booksWithCount = await Promise.all(
    userBooks.map(async (book) => {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(pages)
        .where(eq(pages.bookId, book.id));
      return { ...book, pageCount: countResult[0].count };
    })
  );

  return booksWithCount.map(b => ({
    ...b,
    createdAt: b.createdAt?.toISOString() ?? null,
  }));
}

export default async function HomePage() {
  const { userId } = await auth();
  const books = await getRecentBooks(userId);

  return (
    <div className="min-h-screen selection:bg-orange-200 selection:text-orange-900 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* ── Header ── */}
      <Header />

      <main className="overflow-x-hidden">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-orange-100/20 to-yellow-100/30 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10" />
          <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                Story Craft
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-100 text-3xl md:text-4xl lg:text-5xl">
                AI 儿童绘本创作平台
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              让想象力飞翔，用 AI 创造独一无二的儿童绘本。
              从创意到成品，只需几分钟。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg px-8"
                asChild
              >
                <Link href="/create">
                  <Sparkles className="w-5 h-5 mr-2" />
                  创建新绘本
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── 我的绘本（仅登录用户可见）── */}
        {userId && (
          <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                  我的绘本
                </h2>
                <p className="text-gray-500 dark:text-gray-400">最近创建的绘本作品</p>
              </div>
              {books.length > 0 && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                >
                  <Link href="/create">
                    创建新绘本
                  </Link>
                </Button>
              )}
            </div>

            {books.length === 0 ? (
              <EmptyBooks />
            ) : (
              <BookCardGrid books={books} />
            )}
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <FooterSection />
    </div>
  );
}
