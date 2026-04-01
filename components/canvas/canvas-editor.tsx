"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import * as fabric from "fabric";

interface CanvasEditorProps {
  initialImageUrl: string | null;
  initialText: string;
  initialJson?: Record<string, unknown> | null;
  readOnly?: boolean;
  onCanvasChange?: (json: Record<string, unknown>) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface CanvasEditorRef {
  saveToJson: () => Record<string, unknown> | null;
  getCanvas: () => fabric.Canvas | null;
}

const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(
  (
    {
      initialImageUrl,
      initialText,
      initialJson,
      readOnly = false,
      onCanvasChange,
      width = 800,
      height = 600,
      className,
    },
    ref
  ) => {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      saveToJson: () => {
        if (!fabricCanvasRef.current) return null;
        return fabricCanvasRef.current.toJSON();
      },
      getCanvas: () => fabricCanvasRef.current,
    }));

    useEffect(() => {
      if (!canvasEl.current) return;

      console.log("初始化 Fabric 引擎...");
      const canvas = new fabric.Canvas(canvasEl.current, {
        width,
        height,
        backgroundColor: "#fff",
        selection: !readOnly,
      });

      fabricCanvasRef.current = canvas;
      setIsReady(true);

      const handleChange = () => {
        if (!readOnly && onCanvasChange) {
          onCanvasChange(canvas.toJSON());
        }
      };

      canvas.on("object:modified", handleChange);
      canvas.on("object:added", handleChange);

      return () => {
        setIsReady(false);
        console.log("清理 Fabric 引擎...");
        canvas.off("object:modified", handleChange);
        canvas.off("object:added", handleChange);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [width, height, readOnly]);

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!isReady || !canvas) return;

      let isMounted = true;
      setIsLoading(true);

      const loadContent = async () => {
        try {
          if (!isMounted || !canvas.getContext()) return;

          canvas.clear();
          canvas.backgroundColor = "#fff";

          if (initialJson) {
            console.log("加载 JSON...");
            await canvas.loadFromJSON(initialJson);
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "image") {
                // @ts-ignore
                obj.globalCompositeOperation = "multiply";
              }
              if (readOnly) {
                obj.selectable = false;
                obj.evented = false;
              }
            });
          } else if (initialImageUrl) {
            console.log("加载新素材...");
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(initialImageUrl)}`;
            const img = await fabric.Image.fromURL(proxyUrl, {
              crossOrigin: "anonymous",
            });

            if (img) {
              const canvasWidth = canvas.width || width;
              const canvasHeight = canvas.height || height;
              const scaleX = canvasWidth / img.width!;
              const scaleY = canvasHeight / img.height!;
              const scale = Math.max(scaleX, scaleY);

              img.set({
                originX: "center",
                originY: "center",
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                scaleX: scale,
                scaleY: scale,
                globalCompositeOperation: "multiply",
                selectable: !readOnly,
                evented: !readOnly,
              });

              canvas.add(img);
              canvas.sendObjectToBack(img);
            }

            if (initialText) {
              const textbox = new fabric.Textbox(initialText, {
                top: (canvas.height || height) - 100,
                left: (canvas.width || width) / 2,
                originX: "center",
                width: (canvas.width || width) * 0.8,
                fontSize: 24,
                textAlign: "center",
                fill: "#333",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: 10,
                selectable: !readOnly,
                evented: !readOnly,
                splitByGrapheme: true,
              });
              canvas.add(textbox);
              canvas.setActiveObject(textbox);
            }
          }

          if (isMounted) {
            canvas.requestRenderAll();
          }
        } catch (err) {
          console.error("加载内容失败:", err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      loadContent();
      return () => { isMounted = false; };
    }, [isReady, initialJson, initialImageUrl, initialText]);

    return (
      <div className={`shadow-2xl bg-white rounded-lg overflow-hidden relative ${className}`}>
        <canvas ref={canvasEl} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-sm text-gray-500">画布渲染中...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
