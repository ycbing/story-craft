"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PageData {
  pageNumber: number;
  aiText: string;
  aiImageUrl: string | null;
}

interface BookData {
  id: string;
  title: string;
  status: "draft" | "completed";
  stylePrompt: string | null;
  mainCharacterDesc: string | null;
  pages: PageData[];
}

export default function ViewBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookData | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      loadBook(bookId);
    }
  }, [bookId]);

  const loadBook = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) {
        throw new Error("获取绘本失败");
      }
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error("加载绘本失败:", error);
      toast.error("加载绘本失败");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (book && currentPageIndex < book.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevPage();
    } else if (e.key === "ArrowRight") {
      handleNextPage();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPageIndex, book]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!book || !book.pages.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">绘本不存在或加载失败</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-4 bg-amber-500 hover:bg-amber-600"
          >
            返回作品列表
          </Button>
        </Card>
      </div>
    );
  }

  const currentPage = book.pages[currentPageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">{book.title}</h1>
            <p className="text-sm text-gray-500">
              第 {currentPageIndex + 1} / {book.pages.length} 页
            </p>
          </div>

          <div className="w-20" /> {/* 占位保持居中 */}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="overflow-hidden bg-white shadow-xl">
          {/* 图片区域 */}
          <div className="relative aspect-video bg-gradient-to-br from-amber-100 to-orange-100">
            {currentPage.aiImageUrl ? (
              <Image
                src={currentPage.aiImageUrl}
                alt={`第 ${currentPage.pageNumber} 页`}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400">暂无图片</p>
              </div>
            )}
          </div>

          {/* 文案区域 */}
          <div className="p-8 bg-white">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentPage.aiText || "暂无文案"}
              </p>
            </div>
          </div>
        </Card>

        {/* 翻页控制 */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            variant="outline"
            size="lg"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            上一页
          </Button>

          {/* 页面指示器 */}
          <div className="flex gap-2">
            {book.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPageIndex
                    ? "bg-amber-500 w-8"
                    : "bg-amber-200 hover:bg-amber-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPageIndex === book.pages.length - 1}
            variant="outline"
            size="lg"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-30"
          >
            下一页
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* 键盘提示 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          使用 ← → 方向键或点击按钮翻页
        </div>
      </div>
    </div>
  );
}
