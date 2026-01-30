import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, RefreshCw, Eye } from "lucide-react";
import Image from "next/image";

interface ImagePhasePanelProps {
  imageUrl: string | null;
  prompt?: string;
  isGenerating: boolean;
  onRegenerate?: () => void;
}

export function ImagePhasePanel({
  imageUrl,
  prompt,
  isGenerating,
  onRegenerate,
}: ImagePhasePanelProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-800">配图预览</h3>
        </div>
        {!isGenerating && imageUrl && onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            重新生成
          </Button>
        )}
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
            <p className="text-gray-600">AI 正在绘制图片...</p>
            <p className="text-xs text-gray-500 mt-1">这可能需要 10-30 秒</p>
          </div>
        </div>
      ) : imageUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt="AI 生成的配图"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          {prompt && (
            <details className="text-sm">
              <summary className="cursor-pointer text-amber-700 hover:text-amber-800 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                查看生成提示词
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-gray-600 text-xs">
                {prompt}
              </div>
            </details>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>图片将显示在这里</p>
        </div>
      )}
    </Card>
  );
}
