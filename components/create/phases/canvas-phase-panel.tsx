import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Move, Type, Square, MousePointer2 } from "lucide-react";
import CanvasEditor, { CanvasEditorRef } from "@/components/canvas/canvas-editor";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface CanvasPhasePanelProps {
  imageUrl: string | null;
  text: string;
  canvasJson: Record<string, unknown> | null;
  onCanvasChange?: (json: Record<string, unknown>) => void;
}

export interface CanvasPhasePanelRef {
  saveCanvas: () => Record<string, unknown> | null;
}

export const CanvasPhasePanel = forwardRef<CanvasPhasePanelRef, CanvasPhasePanelProps>(
  ({ imageUrl, text, canvasJson, onCanvasChange }, ref) => {
    const canvasEditorRef = useRef<CanvasEditorRef>(null);

    useImperativeHandle(ref, () => ({
      saveCanvas: () => canvasEditorRef.current?.saveToJson() || null,
    }));

    const handleToolbarAction = (action: string) => {
      // TODO: 实现工具栏操作
      console.log("Toolbar action:", action);
    };

    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-800">画布编辑</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolbarAction("select")}
              title="选择工具"
            >
              <MousePointer2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolbarAction("text")}
              title="添加文字"
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToolbarAction("rect")}
              title="添加矩形"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
          <CanvasEditor
            ref={canvasEditorRef}
            initialImageUrl={imageUrl}
            initialText={text}
            initialJson={canvasJson}
            onCanvasChange={onCanvasChange}
            width={600}
            height={450}
            className="max-w-full"
          />
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="font-medium text-blue-800 mb-1">编辑提示</p>
          <ul className="text-xs space-y-1 text-blue-700">
            <li>• 拖动图片或文字可以调整位置</li>
            <li>• 点击选中后可以调整大小和旋转</li>
            <li>• 双击文字可以直接编辑内容</li>
            <li>• 修改会自动保存</li>
          </ul>
        </div>
      </Card>
    );
  }
);

CanvasPhasePanel.displayName = "CanvasPhasePanel";
