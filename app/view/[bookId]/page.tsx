"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  const [isExporting, setIsExporting] = useState(false);

  // 全屏图片查看
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // 翻页动画
  const [fadeKey, setFadeKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);



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

  const goToPage = useCallback(
    (index: number) => {
      if (!book || isTransitioning) return;
      if (index < 0 || index >= book.pages.length) return;
      if (index === currentPageIndex) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPageIndex(index);
        setFadeKey((k) => k + 1);
        setIsTransitioning(false);
      }, 200);
    },
    [book, currentPageIndex, isTransitioning]
  );

  const handlePrevPage = () => goToPage(currentPageIndex - 1);

  const handleNextPage = () => goToPage(currentPageIndex + 1);

  // 键盘翻页
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") handlePrevPage();
      else if (e.key === "ArrowRight") handleNextPage();
    },
    [currentPageIndex, book, lightboxOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // 下载 PDF
  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await fetch(`/api/books/${bookId}/export`);
      if (!response.ok) throw new Error("导出失败");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book?.title || "绘本"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF 导出成功！");
    } catch (error) {
      console.error("导出 PDF 失败:", error);
      toast.error("PDF 导出失败，请稍后重试");
    } finally {
      setIsExporting(false);
    }
  };

  // 打开灯箱
  const openLightbox = (imageUrl: string) => {
    setLightboxUrl(imageUrl);
    setLightboxOpen(true);
  };

  // 渲染单个页面
  const renderSinglePage = (page: PageData, index: number) => {
    return (
      <Card
        key={page.pageNumber}
        className="overflow-hidden bg-white shadow-xl flex-shrink-0"
      >
        {/* 图片区域 */}
        <div
          className="relative aspect-video bg-gradient-to-br from-amber-100 to-orange-100 cursor-pointer"
          onClick={() => page.aiImageUrl && openLightbox(page.aiImageUrl)}
        >
          {page.aiImageUrl ? (
            <>
              <Image
                src={page.aiImageUrl}
                alt={`第 ${page.pageNumber} 页`}
                fill
                className="object-contain"
                priority={index === 0}
              />
              <div className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1.5 opacity-0 hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">暂无图片</p>
            </div>
          )}
        </div>

        {/* 文案区域 */}
        <div className="p-6 bg-white min-h-[100px]">
          <div className="max-w-2xl mx-auto">
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {page.aiText || "暂无文案"}
            </p>
          </div>
        </div>
      </Card>
    );
  };

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

  const canPrev = currentPageIndex > 0;
  const canNext = currentPageIndex < book.pages.length - 1;

  // 页面指示器：缩略图小方块
  const pageIndicators = book.pages.map((page, index) => {
    const isActive = index === currentPageIndex;
    return (
      <button
        key={index}
        onClick={() => goToPage(index)}
        title={`第 ${index + 1} 页`}
        className={`relative w-8 h-8 rounded transition-all border-2 overflow-hidden flex-shrink-0 ${
          isActive
            ? "border-amber-500 shadow-md scale-110"
            : "border-gray-200 hover:border-amber-300 opacity-60 hover:opacity-100"
        }`}
      >
        {page.aiImageUrl ? (
          <Image
            src={page.aiImageUrl}
            alt={`第 ${page.pageNumber} 页`}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-[10px] text-gray-400">{index + 1}</span>
          </div>
        )}
      </button>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800">
              {book.title}
            </h1>
            <p className="text-sm text-gray-500">
              第 {currentPageIndex + 1} / {book.pages.length} 页
            </p>
          </div>

          {/* 下载 PDF 按钮 */}
          <Button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
            下载 PDF
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          key={fadeKey}
          className={`flex justify-center transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {renderSinglePage(book.pages[currentPageIndex], currentPageIndex)}
        </div>

        {/* 翻页控制 */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={handlePrevPage}
            disabled={!canPrev}
            variant="outline"
            size="lg"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            上一页
          </Button>

          <div className="flex gap-1.5 overflow-x-auto max-w-[400px] px-2 py-1">
            {pageIndicators}
          </div>

          <Button
            onClick={handleNextPage}
            disabled={!canNext}
            variant="outline"
            size="lg"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-30"
          >
            下一页
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* 键盘提示 */}
        <div className="text-center mt-4 text-sm text-gray-500">
          使用 ← → 方向键或点击按钮翻页
        </div>
      </div>

      {/* 图片灯箱 */}
      {lightboxOpen && lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxUrl}
              alt="全屏查看"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
