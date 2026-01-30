"use client";

import { useEffect, useRef } from "react";
import { useBookStore } from "@/lib/store/use-book-store";
import CanvasEditor, {
  CanvasEditorRef,
} from "@/components/canvas/canvas-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // shadcn 的工具函数

// 假设我们已经把 generateOutlineAction 等逻辑移到了第一步
// 这里展示的是“第二步：核心编辑界面”

export default function EditorWorkbench() {
  // 从 Store 获取状态
  const { pages, currentPageIndex, setCurrentPageIndex, updatePage, setPages } =
    useBookStore();

  // 画布的引用，用于触发保存
  const canvasRef = useRef<CanvasEditorRef>(null);

  // 模拟初始化数据 (实际项目中，这里应该是从 generateOutlineAction 填入 Store)
  useEffect(() => {
    if (pages.length === 0) {
      // 仅作演示：初始化3页空数据
      setPages([
        {
          id: 1,
          aiText: "第一页：小猫醒了",
          aiImageUrl: "https://placekitten.com/800/600",
          canvasJson: null,
          isGenerated: true,
        },
        {
          id: 2,
          aiText: "第二页：小猫刷牙",
          aiImageUrl: null,
          canvasJson: null,
          isGenerated: false,
        },
        {
          id: 3,
          aiText: "第三页：小猫出门",
          aiImageUrl: null,
          canvasJson: null,
          isGenerated: false,
        },
      ]);
    }
  }, []);

  // 切换页面的核心逻辑
  const handleSwitchPage = (newIndex: number) => {
    if (newIndex === currentPageIndex) return;

    // 1. 在切换走之前，先保存当前页的画布状态！
    if (canvasRef.current) {
      const json = canvasRef.current.saveToJson();
      if (json) {
        updatePage(currentPageIndex, { canvasJson: json });
        console.log(`第 ${currentPageIndex + 1} 页已保存到内存`);
      }
    }

    // 2. 切换索引
    setCurrentPageIndex(newIndex);
  };

  // 获取当前页的数据
  const currentPageData = pages[currentPageIndex];

  if (!currentPageData) return <div>加载中...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- 左侧侧边栏：页面导航 --- */}
      <div className="w-64 bg-white border-r flex flex-col p-4 overflow-y-auto">
        <h2 className="font-bold mb-4 text-lg">📖 绘本页面 ({pages.length})</h2>
        <div className="space-y-3">
          {pages.map((page, index) => (
            <div
              key={page.id}
              onClick={() => handleSwitchPage(index)}
              className={cn(
                "cursor-pointer border-2 rounded-lg p-2 transition hover:bg-gray-50",
                currentPageIndex === index
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200",
              )}
            >
              <div className="text-xs font-bold text-gray-500 mb-1">
                PAGE {index + 1}
              </div>
              {/* 缩略图占位 */}
              <div className="h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                {page.canvasJson
                  ? "已编辑"
                  : page.isGenerated
                    ? "已生成AI图"
                    : "待生成"}
              </div>
              <div className="text-xs mt-2 truncate text-gray-600">
                {page.aiText}
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-4" variant="outline">
          + 加页
        </Button>
      </div>

      {/* --- 右侧主区域：画布 --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="mb-4 flex justify-between w-[800px] items-center">
          <h3 className="font-bold text-gray-700">
            正在编辑：第 {currentPageIndex + 1} 页
          </h3>
          <Button size="sm" className="bg-green-600">
            保存整本书
          </Button>
        </div>

        {/* key 是关键！当 key 变化时，React 会强制销毁并重建组件。
            这确保了切换页面时，CanvasEditor 会彻底重新初始化，加载新的 initialData。
        */}
        <CanvasEditor
          ref={canvasRef}
          key={currentPageIndex}
          initialImageUrl={currentPageData.aiImageUrl}
          initialText={currentPageData.aiText}
          initialJson={currentPageData.canvasJson}
        />
      </div>
    </div>
  );
}
