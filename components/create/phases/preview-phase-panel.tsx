import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Check, ArrowRight, RefreshCw, Edit3, Image as ImageIcon, FileText } from "lucide-react";
import CanvasEditor from "@/components/canvas/canvas-editor";

interface PreviewPhasePanelProps {
  canvasJson: Record<string, unknown> | null;
  pageNumber: number;
  totalPages: number;
  onApprove?: () => void;
  onRegenerateText?: () => void;
  onRegenerateImage?: () => void;
  onEditCanvas?: () => void;
}

export function PreviewPhasePanel({
  canvasJson,
  pageNumber,
  totalPages,
  onApprove,
  onRegenerateText,
  onRegenerateImage,
  onEditCanvas,
}: PreviewPhasePanelProps) {
  const isLastPage = pageNumber === totalPages;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-800">
            预览第 {pageNumber} 页
          </h3>
          <span className="text-sm text-gray-500">
            (共 {totalPages} 页)
          </span>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
        {canvasJson ? (
          <CanvasEditor
            initialImageUrl={null}
            initialText=""
            initialJson={canvasJson}
            readOnly
            width={600}
            height={450}
            className="max-w-full"
          />
        ) : (
          <div className="w-[600px] h-[450px] flex items-center justify-center bg-white rounded-lg text-gray-400">
            暂无预览
          </div>
        )}
      </div>

      {/* 重做选项 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">需要修改？</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateText}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <FileText className="w-3 h-3 mr-1" />
            重新生成文案
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateImage}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            重新生成图片
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditCanvas}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            编辑画布
          </Button>
        </div>
      </div>

      {/* 确认按钮 */}
      <div className="pt-4 border-t">
        <Button
          onClick={onApprove}
          size="lg"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
        >
          <Check className="w-4 h-4 mr-2" />
          {isLastPage ? "完成，导出绘本" : "确认，继续下一页"}
          {!isLastPage && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* 进度提示 */}
      <div className="text-center text-sm text-gray-500">
        {isLastPage ? (
          <p>所有页面已完成，可以导出你的绘本了！</p>
        ) : (
          <p>
            完成度：{Math.round((pageNumber / totalPages) * 100)}% ·
            还有 {totalPages - pageNumber} 页
          </p>
        )}
      </div>
    </Card>
  );
}
