"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateOutlineAction } from "@/actions/generate-story";
import { generatePageImageAction } from "@/actions/generate-page-image";
import { refinePageTextAction } from "@/actions/refine-page-text";
import { saveBookAction } from "@/actions/save-book";
import { useBookStore } from "@/lib/store/use-book-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Sparkles,
  Palette,
  User,
  Check,
  Edit3,
  Eye,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { STYLE_PRESETS, AGE_PRESETS } from "@/lib/constants/style-presets";
import { toast } from "sonner";

type Phase = "input" | "generating" | "preview" | "editing";

export default function CreatePage() {
  const router = useRouter();

  // Phase
  const [phase, setPhase] = useState<Phase>("input");

  // 表单状态
  const [userInput, setUserInput] = useState("");
  const [mainCharacterDesc, setMainCharacterDesc] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("picture-book");
  const [selectedAge, setSelectedAge] = useState("3-6");

  // 生成进度
  const [generatingPage, setGeneratingPage] = useState(0);
  const [generatingStep, setGeneratingStep] = useState("");
  const [generatedPages, setGeneratedPages] = useState<
    Array<{
      pageNumber: number;
      summary: string;
      aiText: string;
      aiImageUrl: string | null;
    }>
  >([]);
  const [bookTitle, setBookTitle] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store
  const setConfig = useBookStore((state) => state.setConfig);
  const setOutline = useBookStore((state) => state.setOutline);

  // 一键生成完整绘本
  const handleGenerateAll = async () => {
    if (!userInput.trim()) {
      toast.error("请输入故事创意");
      return;
    }

    setPhase("generating");
    setIsGeneratingAll(true);
    setError(null);

    const stylePreset = STYLE_PRESETS.find((s) => s.value === selectedStyle);

    // 保存配置
    setConfig({
      userInput,
      stylePreset: selectedStyle,
      stylePrompt: stylePreset?.prompt || "",
      mainCharacterDesc,
      targetAudience: selectedAge as "3-6" | "6-9" | "9-12",
    });

    try {
      // 步骤 1：生成大纲
      setGeneratingStep("正在构思故事大纲...");
      setGeneratingPage(0);

      const outlineResult = await generateOutlineAction({
        userInput,
        targetAudience: selectedAge,
        mainCharacterDesc,
        stylePrompt: stylePreset?.prompt || "",
      });

      if (!outlineResult.success || !outlineResult.data) {
        throw new Error(outlineResult.error || "故事大纲生成失败");
      }

      const outline = outlineResult.data;
      setBookTitle(outline.title);
      setOutline(outline);

      const pages: typeof generatedPages = outline.pages.map((p) => ({
        pageNumber: p.pageNumber,
        summary: p.summary,
        aiText: "",
        aiImageUrl: null,
      }));

      // 步骤 2：逐页生成文案 + 配图
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setGeneratingPage(i + 1);

        // 生成文案
        setGeneratingStep(`第 ${i + 1}/8 页：正在创作文案...`);
        pages[i].aiText = page.summary; // 先用摘要作为 fallback

        const textResult = await refinePageTextAction({
          originalSummary: page.summary,
          pageNumber: page.pageNumber,
          bookTitle: outline.title,
          stylePrompt: stylePreset?.prompt || "",
          targetAudience: selectedAge,
        });

        if (textResult.success && textResult.refinedText) {
          pages[i].aiText = textResult.refinedText;
        }

        setGeneratedPages([...pages]);

        // 生成配图
        setGeneratingStep(`第 ${i + 1}/8 页：正在绘制插画...`);
        const imageResult = await generatePageImageAction({
          refinedText: pages[i].aiText,
          originalSummary: page.summary,
          stylePrompt: stylePreset?.prompt || "",
          mainCharacterDesc,
          pageNumber: page.pageNumber,
        });

        if (imageResult.success && imageResult.imageUrl) {
          pages[i].aiImageUrl = imageResult.imageUrl;
        }

        setGeneratedPages([...pages]);
      }

      setGeneratingStep("完成！");
      setPhase("preview");
      toast.success("绘本生成完成！");
    } catch (err) {
      console.error("生成失败:", err);
      setError(err instanceof Error ? err.message : "生成失败，请重试");
      toast.error(err instanceof Error ? err.message : "生成失败");
      setPhase("input");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // 重新生成单页图片
  const handleRegenerateImage = async (pageIndex: number) => {
    const page = generatedPages[pageIndex];
    const stylePreset = STYLE_PRESETS.find((s) => s.value === selectedStyle);

    setGeneratedPageLoading(pageIndex, "image");

    const result = await generatePageImageAction({
      refinedText: page.aiText,
      originalSummary: page.summary,
      stylePrompt: stylePreset?.prompt || "",
      mainCharacterDesc,
      pageNumber: page.pageNumber,
    });

    if (result.success && result.imageUrl) {
      const updated = [...generatedPages];
      updated[pageIndex] = { ...updated[pageIndex], aiImageUrl: result.imageUrl };
      setGeneratedPages(updated);
      toast.success("图片已重新生成");
    } else {
      toast.error(result.error || "图片生成失败");
    }

    setGeneratedPageLoading(pageIndex, null);
  };

  // 加载状态跟踪
  const [pageLoading, setPageLoading] = useState<Record<number, string | null>>({});
  const setGeneratedPageLoading = (index: number, type: string | null) => {
    setPageLoading((prev) => ({ ...prev, [index]: type }));
  };

  // 保存绘本
  const handleSave = async () => {
    try {
      const result = await saveBookAction({
        title: bookTitle,
        stylePrompt: STYLE_PRESETS.find((s) => s.value === selectedStyle)?.prompt || "",
        mainCharacterDesc,
        status: "completed",
        pagesData: generatedPages.map((p) => ({
          pageNumber: p.pageNumber,
          aiText: p.aiText,
          aiImageUrl: p.aiImageUrl,
          canvasJson: null,
          outlineSummary: p.summary,
        })),
      });

      if (result.success) {
        toast.success("绘本已保存！");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "保存失败");
      }
    } catch (error) {
      toast.error("保存失败，请重试");
    }
  };

  // 重新开始
  const handleReset = () => {
    setPhase("input");
    setGeneratedPages([]);
    setBookTitle("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ==================== Phase 1: 输入 ==================== */}
      {phase === "input" && (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              一键创作绘本
            </h1>
            <p className="text-gray-600 text-lg">
              输入一个故事点子，AI 自动生成完整绘本
            </p>
          </div>

          <Card className="p-6 md:p-8 shadow-xl border-amber-200">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  故事创意
                </label>
                <Textarea
                  placeholder="例如：一只想飞上月球的企鹅、勇敢的小火龙、迷路的小星星..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-amber-600" />
                  主角描述（可选）
                </label>
                <Input
                  placeholder="例如：一只黑白相间的小企鹅，戴着一顶红色毛线帽"
                  value={mainCharacterDesc}
                  onChange={(e) => setMainCharacterDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4 text-amber-600" />
                  艺术风格
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setSelectedStyle(style.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedStyle === style.value
                          ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{style.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">目标年龄</label>
                <div className="flex gap-2">
                  {AGE_PRESETS.map((age) => (
                    <button
                      key={age.value}
                      type="button"
                      onClick={() => setSelectedAge(age.value)}
                      className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                        selectedAge === age.value
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="font-medium">{age.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{age.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateAll}
                disabled={!userInput.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg py-6"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                一键生成绘本
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== Phase 2: 生成中 ==================== */}
      {phase === "generating" && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full shadow-xl animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                AI 正在创作绘本...
              </h2>
              <p className="text-gray-500">{generatingStep}</p>
            </div>

            {/* 进度条 */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>进度</span>
                <span>{generatingPage}/8 页</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(generatingPage / 8) * 100}%` }}
                />
              </div>
              {/* 页面缩略图预览 */}
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      i < generatingPage
                        ? "bg-amber-100 border-amber-400 text-amber-700"
                        : i === generatingPage
                          ? "bg-amber-50 border-amber-500 text-amber-700 animate-pulse"
                          : "bg-gray-50 border-gray-200 text-gray-300"
                    }`}
                  >
                    {i < generatingPage ? "✓" : i + 1}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
                <Button onClick={handleReset} variant="outline" size="sm" className="mt-2">
                  返回修改
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Phase 3: 预览 ==================== */}
      {phase === "preview" && (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📖 《{bookTitle}》
              </h1>
              <p className="text-gray-500 mt-1">绘本已生成，你可以预览、调整或保存</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="border-amber-300 text-amber-700">
                <RefreshCw className="w-4 h-4 mr-1" />
                重新生成
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Check className="w-4 h-4 mr-1" />
                保存绘本
              </Button>
            </div>
          </div>

          {/* 绘本页面展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generatedPages.map((page, index) => (
              <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-all border border-amber-100">
                <div className="aspect-square bg-gray-100 relative">
                  {page.aiImageUrl ? (
                    <img
                      src={page.aiImageUrl}
                      alt={`第 ${page.pageNumber} 页`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  {/* 页码 */}
                  <div className="absolute bottom-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-amber-700 shadow">
                    {page.pageNumber}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {page.aiText}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-amber-600 hover:bg-amber-50 text-xs"
                    onClick={() => handleRegenerateImage(index)}
                    disabled={pageLoading[index] === "image"}
                  >
                    {pageLoading[index] === "image" ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    换一张图
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* 底部操作 */}
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" size="lg" onClick={handleReset} className="border-amber-300 text-amber-700 px-8">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新创作
            </Button>
            <Button size="lg" onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8">
              <Check className="w-4 h-4 mr-2" />
              保存到我的作品
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
