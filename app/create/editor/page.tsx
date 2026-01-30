"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBookStore } from "@/lib/store/use-book-store";
import { ProgressIndicator } from "@/components/create/progress-indicator";
import { TextPhasePanel } from "@/components/create/phases/text-phase-panel";
import { ImagePhasePanel } from "@/components/create/phases/image-phase-panel";
import { CanvasPhasePanel } from "@/components/create/phases/canvas-phase-panel";
import { PreviewPhasePanel } from "@/components/create/phases/preview-phase-panel";
import { refinePageTextAction } from "@/actions/refine-page-text";
import { generatePageImageAction } from "@/actions/generate-page-image";
import { saveBookAction } from "@/actions/save-book";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// 相位标签
const PHASES = [
  { id: "text", label: "文案", icon: "📝" },
  { id: "image", label: "配图", icon: "🎨" },
  { id: "canvas", label: "画布", icon: "🖼️" },
  { id: "preview", label: "预览", icon: "✅" },
] as const;

export default function EditorPage() {
  const router = useRouter();
  const canvasPhaseRef = useRef<{
    saveCanvas: () => Record<string, unknown> | null;
  }>(null);

  // Store state
  const pages = useBookStore((state) => state.pages);
  const currentPageIndex = useBookStore((state) => state.currentPageIndex);
  const title = useBookStore((state) => state.title);
  const config = useBookStore((state) => state.config);
  const workflow = useBookStore((state) => state.workflow);

  // Store actions
  const setCurrentPageIndex = useBookStore(
    (state) => state.setCurrentPageIndex,
  );
  const updatePage = useBookStore((state) => state.updatePage);
  const setCurrentPhase = useBookStore((state) => state.setCurrentPhase);
  const setGenerating = useBookStore((state) => state.setGenerating);
  const nextPage = useBookStore((state) => state.nextPage);

  // Local state
  const [editedText, setEditedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [canvasJson, setCanvasJson] = useState<Record<string, unknown> | null>(
    null,
  );

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
      setCanvasJson(currentPage.canvasJson);
      // 如果页面已生成，跳到预览，否则从文案开始
      if (currentPage.isGenerated) {
        setCurrentPhase("preview");
      } else if (currentPage.aiText) {
        setCurrentPhase("image");
      } else {
        setCurrentPhase("text");
      }
    }
  }, [currentPageIndex, currentPage, setCurrentPhase]);

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // 生成文案
  const handleGenerateText = async () => {
    setGenerating(true);
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
        setCurrentPhase("image");
      } else {
        alert("文案生成失败，请重试");
      }
    } catch (error) {
      console.error("生成文案失败:", error);
      alert("文案生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  // 保存编辑的文案
  const handleSaveTextEdit = () => {
    updatePage(currentPageIndex, { aiText: editedText });
    setIsEditing(false);
  };

  // 生成图片
  const handleGenerateImage = async () => {
    setGenerating(true);
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
        setGeneratedPrompt(result.revisedPrompt || "");
        updatePage(currentPageIndex, { aiImageUrl: result.imageUrl });
        setCurrentPhase("canvas");
      } else {
        alert(result.error || "图片生成失败，请重试");
      }
    } catch (error) {
      console.error("生成图片失败:", error);
      alert("图片生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  // 画布变化时保存
  const handleCanvasChange = (json: Record<string, unknown>) => {
    setCanvasJson(json);
    updatePage(currentPageIndex, { canvasJson: json });
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
          canvasJson: p.canvasJson,
          outlineSummary: p.outlineSummary,
        })),
      });

      if (result.success) {
        alert("绘本保存成功！");
        // TODO: 添加 PDF 导出功能
        router.push("/");
      } else {
        alert(result.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
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

        {/* 相位标签 */}
        <Card className="p-2">
          <div className="flex gap-2">
            {PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id as any)}
                disabled={workflow.isGenerating}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${
                    workflow.currentPhase === phase.id
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-amber-50"
                  }
                  ${workflow.isGenerating ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <span>{phase.icon}</span>
                <span className="hidden sm:inline">{phase.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* 主内容区 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：当前页面信息 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                第 {currentPage.id} 页
              </h3>
              <p className="text-sm text-gray-500 mb-3">原始摘要</p>
              <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3">
                {currentPage.outlineSummary}
              </p>
            </Card>

            {/* 自动提示当前需要做什么 */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">当前任务</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {workflow.currentPhase === "text" && (
                  <>
                    <li>{`1. 点击"生成文案"让 AI 创作这一页的文字`}</li>
                    <li>2. 可以编辑生成的文案</li>
                    <li>{`3. 满意后点击"生成配图"`}</li>
                  </>
                )}
                {workflow.currentPhase === "image" && (
                  <>
                    <li>1. AI 已根据文案生成配图</li>
                    <li>2. 查看图片效果</li>
                    <li>3. 如不满意可重新生成</li>
                    <li>{`4. 满意后点击"下一步"`}</li>
                  </>
                )}
                {workflow.currentPhase === "canvas" && (
                  <>
                    <li>1. 在画布上调整图片和文字的位置</li>
                    <li>2. 可以添加、删除或修改元素</li>
                    <li>3. 编辑会自动保存</li>
                    <li>{`4. 完成后点击"预览"`}</li>
                  </>
                )}
                {workflow.currentPhase === "preview" && (
                  <>
                    <li>1. 预览最终效果</li>
                    <li>2. 如需修改可返回上一步</li>
                    <li>{`3. 满意后点击"确认继续"`}</li>
                  </>
                )}
              </ul>
            </Card>
          </div>

          {/* 右侧：相位面板 */}
          <div className="lg:col-span-2">
            {workflow.currentPhase === "text" && (
              <div className="space-y-4">
                <TextPhasePanel
                  text={editedText}
                  isGenerating={workflow.isGenerating}
                  onEdit={() => setIsEditing(true)}
                  onRegenerate={handleGenerateText}
                />
                {editedText && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setCurrentPhase("image")}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                    >
                      生成配图 →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {workflow.currentPhase === "image" && (
              <div className="space-y-4">
                <ImagePhasePanel
                  imageUrl={generatedImageUrl}
                  prompt={generatedPrompt}
                  isGenerating={workflow.isGenerating}
                  onRegenerate={handleGenerateImage}
                />
                {generatedImageUrl && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setCurrentPhase("canvas")}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                    >
                      编辑画布 →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {workflow.currentPhase === "canvas" && (
              <div className="space-y-4">
                <CanvasPhasePanel
                  ref={canvasPhaseRef}
                  imageUrl={generatedImageUrl}
                  text={editedText}
                  canvasJson={canvasJson}
                  onCanvasChange={handleCanvasChange}
                />
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentPhase("preview")}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    预览效果 →
                  </Button>
                </div>
              </div>
            )}

            {workflow.currentPhase === "preview" && (
              <PreviewPhasePanel
                canvasJson={canvasJson}
                pageNumber={currentPage.id}
                totalPages={pages.length}
                onApprove={handleApprovePage}
                onRegenerateText={() => setCurrentPhase("text")}
                onRegenerateImage={() => setCurrentPhase("image")}
                onEditCanvas={() => setCurrentPhase("canvas")}
              />
            )}
          </div>
        </div>
      </div>

      {/* 编辑文案对话框 */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文案</DialogTitle>
            <DialogDescription>
              修改第 {currentPage.id} 页的文案内容
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={6}
            placeholder="输入这一页的文案..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTextEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
