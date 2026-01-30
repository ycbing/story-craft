"use client";

import { useState } from "react";
import { generateOutlineAction } from "@/actions/generate-story";
import { Button } from "@/components/ui/button"; // 假设你装了 shadcn
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // 图标

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outline, setOutline] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);

    // 调用刚才写的 Server Action
    const result = await generateOutlineAction(prompt);

    if (result.success) {
      setOutline(result.data);
    } else {
      alert("出错了！");
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">✨ AI 绘本策划师</h1>
        <p className="text-gray-500">
          输入一个简单的点子，为你生成完整的分镜大纲
        </p>
      </div>

      {/* 输入区 */}
      <div className="flex gap-2">
        <Input
          placeholder="例如：一只想飞上月球的企鹅..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "构思中..." : "生成大纲"}
        </Button>
      </div>

      {/* 结果展示区 */}
      {outline && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-amber-700">
              《{outline.title}》
            </h2>
          </div>

          <div className="grid gap-3">
            {outline.pages.map((page: any) => (
              <Card
                key={page.pageNumber}
                className="p-4 border-l-4 border-l-amber-500 hover:shadow-md transition"
              >
                <div className="flex gap-4">
                  <span className="font-bold text-gray-300 text-xl">
                    0{page.pageNumber}
                  </span>
                  <p className="text-gray-700">{page.summary}</p>
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full mt-4" size="lg" variant="secondary">
            确认大纲，开始绘制 (下一步) 👉
          </Button>
        </div>
      )}
    </div>
  );
}
