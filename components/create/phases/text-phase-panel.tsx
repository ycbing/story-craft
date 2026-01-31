import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Edit3, RefreshCw, Sparkles } from "lucide-react";

interface TextPhasePanelProps {
  text: string;
  isGenerating: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
}

export function TextPhasePanel({
  text,
  isGenerating,
  onEdit,
  onRegenerate,
}: TextPhasePanelProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-800">文案内容</h3>
        </div>
        {!isGenerating && text && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                编辑
              </Button>
            )}
            {onRegenerate && (
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
        )}
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
            <p className="text-gray-600">AI 正在创作文案...</p>
          </div>
        </div>
      ) : text ? (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <FileText className="w-16 h-16 mx-auto text-gray-300" />
          <div className="space-y-2">
            <p className="text-gray-500">文案将显示在这里</p>
            {onRegenerate && (
              <Button
                onClick={onRegenerate}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                生成文案
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
