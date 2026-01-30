"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookStore } from "@/lib/store/use-book-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Check,
  Edit3,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const outline = useBookStore((state) => state.outline);
  const setOutline = useBookStore((state) => state.setOutline);
  const initializeFromOutline = useBookStore((state) => state.initializeFromOutline);
  const setWorkflowStep = useBookStore((state) => state.setWorkflowStep);

  const [editingPage, setEditingPage] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 如果没有大纲，重定向回创建页面
  useEffect(() => {
    if (!outline) {
      router.push("/create");
    }
  }, [outline, router]);

  if (!outline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  const handleEditPage = (pageNumber: number, currentSummary: string) => {
    setEditingPage(pageNumber);
    setEditText(currentSummary);
  };

  const handleSaveEdit = () => {
    if (editingPage === null) return;

    const updatedPages = outline.pages.map((page) =>
      page.pageNumber === editingPage
        ? { ...page, summary: editText.trim() }
        : page
    );

    setOutline({ ...outline, pages: updatedPages });
    setEditingPage(null);
    setEditText("");
  };

  const handleStartCreating = () => {
    initializeFromOutline(outline);
    setWorkflowStep("editor");
    router.push("/create/editor");
  };

  const handleBack = () => {
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        {/* 标题区 */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回修改
          </Button>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              故事大纲确认
            </h1>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif text-amber-800">
                《{outline.title}》
              </h2>
              <p className="text-gray-600">
                请检查并确认以下 8 页故事内容，你可以修改每一页的描述
              </p>
            </div>
          </div>
        </div>

        {/* 大纲内容 */}
        <div className="space-y-3">
          {outline.pages.map((page, index) => (
            <Card
              key={page.pageNumber}
              className="p-5 shadow-md hover:shadow-lg transition border-l-4 border-l-amber-500"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow">
                    {String(page.pageNumber).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-700 leading-relaxed">{page.summary}</p>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingPage === page.pageNumber}
                      onOpenChange={(open) => {
                        if (!open) setEditingPage(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPage(page.pageNumber, page.summary)}
                          className="text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          编辑
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑第 {page.pageNumber} 页</DialogTitle>
                          <DialogDescription>
                            修改这一页的场景描述，让它更符合你的想象
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="mt-4"
                          placeholder="描述这一页发生了什么..."
                        />
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingPage(null)}
                          >
                            取消
                          </Button>
                          <Button onClick={handleSaveEdit}>
                            保存修改
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重新生成
          </Button>
          <Button
            size="lg"
            onClick={handleStartCreating}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg px-8"
          >
            <Check className="w-4 h-4 mr-2" />
            确认大纲，开始创作
          </Button>
        </div>

        {/* 提示信息 */}
        <div className="text-center text-sm text-gray-500 bg-white/50 rounded-lg p-4">
          <p className="font-medium text-amber-700 mb-1">接下来</p>
          <p>确认后，AI 将为每一页生成文案和配图，你可以逐页编辑和调整</p>
        </div>
      </div>
    </div>
  );
}
