"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateOutlineAction } from "@/actions/generate-story";
import { useBookStore } from "@/lib/store/use-book-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Palette, User } from "lucide-react";
import { STYLE_PRESETS, AGE_PRESETS } from "@/lib/constants/style-presets";

export default function CreatePage() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [mainCharacterDesc, setMainCharacterDesc] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("picture-book");
  const [selectedAge, setSelectedAge] = useState("3-6");
  const [isLoading, setIsLoading] = useState(false);

  const setConfig = useBookStore((state) => state.setConfig);
  const setOutline = useBookStore((state) => state.setOutline);
  const setWorkflowStep = useBookStore((state) => state.setWorkflowStep);

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      alert("请输入故事创意");
      return;
    }

    setIsLoading(true);

    // 保存配置到 store
    const stylePreset = STYLE_PRESETS.find((s) => s.value === selectedStyle);
    setConfig({
      userInput,
      stylePreset: selectedStyle,
      stylePrompt: stylePreset?.prompt || "",
      mainCharacterDesc,
      targetAudience: selectedAge as "3-6" | "6-9" | "9-12",
    });

    // 调用 Server Action
    const result = await generateOutlineAction({
      userInput,
      targetAudience: selectedAge,
      mainCharacterDesc,
      stylePrompt: stylePreset?.prompt,
    });

    if (result.success && result.data) {
      setOutline(result.data);
      setWorkflowStep("confirm");
      router.push("/create/confirm");
    } else {
      alert(result.error || "生成失败，请重试");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
        {/* 标题区 */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            AI 绘本策划师
          </h1>
          <p className="text-gray-600 text-lg">
            输入一个简单的点子，AI 为你生成完整的 8 页绘本故事
          </p>
        </div>

        {/* 配置表单 */}
        <Card className="p-6 md:p-8 shadow-xl border-amber-200">
          <div className="space-y-6">
            {/* 故事创意 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Sparkles className="w-4 h-4 text-amber-600" />
                故事创意
              </label>
              <Textarea
                placeholder="例如：一只想飞上月球的企鹅、勇敢的小火龙、迷路的小星星..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* 主角描述 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-amber-600" />
                主角描述（可选）
              </label>
              <Input
                placeholder="例如：一只黑白相间的小企鹅，有着明亮的橙色围巾"
                value={mainCharacterDesc}
                onChange={(e) => setMainCharacterDesc(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                详细描述主角的外观，AI 会在每一页保持角色一致性
              </p>
            </div>

            {/* 艺术风格选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Palette className="w-4 h-4 text-amber-600" />
                艺术风格
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setSelectedStyle(style.value)}
                    disabled={isLoading}
                    className={`
                      p-3 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedStyle === style.value
                          ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                      }
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="text-center">
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 目标年龄 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">目标年龄</label>
              <div className="flex gap-2">
                {AGE_PRESETS.map((age) => (
                  <button
                    key={age.value}
                    type="button"
                    onClick={() => setSelectedAge(age.value)}
                    disabled={isLoading}
                    className={`
                      flex-1 p-3 rounded-lg border-2 text-center transition-all
                      ${
                        selectedAge === age.value
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                      }
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="font-medium">{age.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{age.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !userInput.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "正在构思故事..." : "生成故事大纲"}
            </Button>
          </div>
        </Card>

        {/* 提示信息 */}
        <div className="text-center text-sm text-gray-500">
          <p>AI 将为你生成 8 页故事大纲，你可以在确认后逐页创作</p>
        </div>
      </div>
    </div>
  );
}
