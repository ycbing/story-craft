"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookStore } from "@/lib/store/use-book-store";
import { ProgressIndicator } from "@/components/create/progress-indicator";
import { refinePageTextAction } from "@/actions/refine-page-text";
import { generatePageImageAction } from "@/actions/generate-page-image";
import { saveBookAction } from "@/actions/save-book";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Wand2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function EditorPage() {
  const router = useRouter();

  // Store state
  const pages = useBookStore((state) => state.pages);
  const currentPageIndex = useBookStore((state) => state.currentPageIndex);
  const title = useBookStore((state) => state.title);
  const config = useBookStore((state) => state.config);

  // Store actions
  const setCurrentPageIndex = useBookStore(
    (state) => state.setCurrentPageIndex,
  );
  const updatePage = useBookStore((state) => state.updatePage);
  const nextPage = useBookStore((state) => state.nextPage);

  // Local state
  const [editedText, setEditedText] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const currentPage = pages[currentPageIndex];

  // 如果没有页面，重定向回确认页面
  useEffect(() => {
    if (pages.length === 0) {
      router.push("/create/confirm");
    }
  }, [pages.length, router]);

  // 当切换页面时，重置状态
  useEffect(() => {
    if (currentPage) {
      setEditedText(currentPage.aiText || "");
      setGeneratedImageUrl(currentPage.aiImageUrl);
    }
  }, [currentPageIndex, currentPage]);

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // 生成文案
  const handleGenerateText = async () => {
    setIsGeneratingText(true);
    try {
      const result = await refinePageTextAction({
        originalSummary: currentPage.outlineSummary || "",
        pageNumber: currentPage.id,
        bookTitle: title,
        stylePrompt: config.stylePrompt,
        targetAudience: config.targetAudience,
      });

      if (result.success && result.refinedText) {
        setEditedText(result.refinedText);
        updatePage(currentPageIndex, { aiText: result.refinedText });
        toast.success("文案生成成功！");
      } else {
        toast.error(result.error || "文案生成失败，请重试");
      }
    } catch (error) {
      console.error("生成文案失败:", error);
      toast.error("文案生成失败，请重试");
    } finally {
      setIsGeneratingText(false);
    }
  };

  // 保存编辑的文案
  const handleSaveTextEdit = () => {
    updatePage(currentPageIndex, { aiText: editedText });
    toast.success("文案已保存");
  };

  // 生成图片
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const result = await generatePageImageAction({
        refinedText: editedText || currentPage.aiText || "",
        originalSummary: currentPage.outlineSummary || "",
        stylePrompt: config.stylePrompt,
        mainCharacterDesc: config.mainCharacterDesc,
        pageNumber: currentPage.id,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        updatePage(currentPageIndex, { aiImageUrl: result.imageUrl });
        toast.success("配图生成成功！");
      } else {
        toast.error(result.error || "图片生成失败，请重试");
      }
    } catch (error) {
      console.error("生成图片失败:", error);
      toast.error("图片生成失败，请重试");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 确认当前页
  const handleApprovePage = async () => {
    // 标记为已生成
    updatePage(currentPageIndex, { isGenerated: true });

    // 如果是最后一页，保存并导出
    if (currentPageIndex === pages.length - 1) {
      await handleSaveAndExport();
    } else {
      nextPage();
    }
  };

  // 保存并导出
  const handleSaveAndExport = async () => {
    try {
      const result = await saveBookAction({
        title,
        stylePrompt: config.stylePrompt,
        mainCharacterDesc: config.mainCharacterDesc,
        status: "completed",
        pagesData: pages.map((p) => ({
          pageNumber: p.id,
          aiText: p.aiText,
          aiImageUrl: p.aiImageUrl,
          canvasJson: null,
          outlineSummary: p.outlineSummary,
        })),
      });

      if (result.success) {
        toast.success("绘本保存成功！");
        router.push("/");
      } else {
        toast.error(result.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败，请重试");
    }
  };

  // 返回上一页
  const handleBack = () => {
    router.push("/create/confirm");
  };

  // 切换到指定页面
  const handlePageClick = (index: number) => {
    // 只允许切换到已完成的页面或当前页的下一页
    if (index <= currentPageIndex || pages[index]?.isGenerated) {
      setCurrentPageIndex(index);
    }
  };

  const completedPages = pages.filter((p) => p.isGenerated).map((p) => p.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              第 {currentPage.id} 页 / 共 {pages.length} 页
            </span>
            <ProgressIndicator
              currentPage={currentPageIndex}
              totalPages={pages.length}
              completedPages={completedPages}
              onPageClick={handlePageClick}
            />
          </div>
        </div>

        {/* 主内容区：左右分栏 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：文案区域 */}
          <div className="space-y-4">
            {/* 原始摘要 */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-gray-500 mb-2">原始摘要</p>
              <p className="text-sm text-gray-700">
                {currentPage.outlineSummary}
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📝 文案</h3>
                <Button
                  onClick={handleGenerateText}
                  disabled={isGeneratingText}
                  size="sm"
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <Wand2 className="w-4 h-4 mr-1" />
                  {editedText ? "重新生成" : "生成文案"}
                </Button>
              </div>

              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="点击「生成文案」让 AI 创作这一页的文字，或直接输入..."
                rows={12}
                className="resize-none"
                disabled={isGeneratingText}
              />

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSaveTextEdit}
                  disabled={
                    !editedText || isGeneratingText || isGeneratingImage
                  }
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  保存文案
                </Button>
                <Button
                  onClick={handleGenerateImage}
                  disabled={
                    !editedText || isGeneratingText || isGeneratingImage
                  }
                  variant="outline"
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  生成配图 →
                </Button>
              </div>
            </Card>
          </div>

          {/* 右侧：配图区域 */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🎨 配图</h3>
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !editedText}
                  size="sm"
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {generatedImageUrl ? "重新生成" : "生成配图"}
                </Button>
              </div>

              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {isGeneratingImage ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">正在生成中...</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt={`第 ${currentPage.id} 页配图`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400 p-6">
                    <p className="text-4xl mb-2">🖼️</p>
                    <p className="text-sm">生成文案后点击「生成配图」</p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="mt-4">
                  <Button
                    onClick={handleApprovePage}
                    disabled={isGeneratingImage}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    {currentPageIndex === pages.length - 1
                      ? "完成并保存"
                      : "确认继续下一页 →"}
                  </Button>
                </div>
              )}
            </Card>

            {/* 提示信息 */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">操作提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. 先生成或编辑文案</li>
                <li>2. 点击「生成配图」创建插图</li>
                <li>3. 满意后点击「确认继续」</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
