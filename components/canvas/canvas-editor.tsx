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

// 定义暴露给父组件的方法
export interface CanvasEditorRef {
  saveToJson: () => Record<string, unknown> | null;
  getCanvas: () => fabric.Canvas | null;
}

// 使用 forwardRef 包裹组件
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
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // 🔥 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      saveToJson: () => {
        if (!fabricCanvasRef.current) return null;
        return fabricCanvasRef.current.toJSON();
      },
      getCanvas: () => fabricCanvasRef.current,
    }));

    useEffect(() => {
      if (!canvasEl.current) return;

      // 防止重复初始化
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }

      const canvas = new fabric.Canvas(canvasEl.current, {
        width,
        height,
        backgroundColor: "#fff",
        selection: !readOnly, // 只读模式禁止选择
      });

      // 设置只读模式
      if (readOnly) {
        canvas.defaultCursor = "default";
        canvas.selectionColor = "transparent";
        canvas.selectionBorderColor = "transparent";
      }

      fabricCanvasRef.current = canvas;

      // 加载内容的函数
      const loadContent = async () => {
        setIsLoading(true);
        setImageError(false);

        try {
          if (initialJson) {
            // A. 如果有存档，直接加载 JSON
            console.log("加载已有 JSON 存档...");
            canvas.loadFromJSON(initialJson, () => {
              canvas.requestRenderAll();
              // 恢复正片叠底等特殊属性
              canvas.getObjects().forEach((obj: any) => {
                if (obj.type === "image") obj.globalCompositeOperation = "multiply";
                if (readOnly) {
                  obj.selectable = false;
                  obj.evented = false;
                }
              });
              setIsLoading(false);
            });
          } else if (initialImageUrl) {
            // B. 加载新图片和文字
            console.log("加载 AI 新素材...");

            // 加载图片 - Fabric.js v7 使用 Promise
            try {
              const img = await fabric.Image.fromURL(initialImageUrl, {
                crossOrigin: "anonymous",
              });

              if (!img) {
                setImageError(true);
                setIsLoading(false);
                return;
              }

              // 计算缩放比例，使图片适应画布
              const canvasWidth = canvas.width || width;
              const canvasHeight = canvas.height || height;
              const scale = Math.min(
                canvasWidth / (img.width || 1),
                canvasHeight / (img.height || 1)
              );

              img.scale(scale * 0.9); // 留一点边距
              img.set({
                originX: "center",
                originY: "center",
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                globalCompositeOperation: "multiply", // 正片叠底效果
                selectable: !readOnly,
                evented: !readOnly,
              });

              canvas.add(img);

              // 添加文字
              if (initialText) {
                const textbox = new fabric.Textbox(initialText, {
                  top: canvasHeight - 100,
                  left: canvasWidth / 2,
                  originX: "center",
                  width: canvasWidth * 0.8,
                  fontSize: 24,
                  textAlign: "center",
                  fill: "#333",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  padding: 10,
                  selectable: !readOnly,
                  evented: !readOnly,
                });
                canvas.add(textbox);
              }

              canvas.requestRenderAll();
              setIsLoading(false);

              // 通知父组件画布已更新
              if (onCanvasChange) {
                onCanvasChange(canvas.toJSON());
              }
            } catch (error) {
              console.error("加载图片失败:", error);
              setImageError(true);
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("加载画布内容失败:", error);
          setImageError(true);
          setIsLoading(false);
        }
      };

      loadContent();

      // 监听画布变化（仅在非只读模式）
      if (!readOnly && onCanvasChange) {
        const handleChange = () => {
          onCanvasChange(canvas.toJSON());
        };
        canvas.on("object:modified", handleChange);
        canvas.on("object:added", handleChange);
        canvas.on("object:removed", handleChange);

        return () => {
          canvas.off("object:modified", handleChange);
          canvas.off("object:added", handleChange);
          canvas.off("object:removed", handleChange);
        };
      }

      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [width, height, readOnly, initialJson]); // 这些变化时才重新初始化

    // 当初始图片或文字变化时重新加载（仅在没有 JSON 存档时）
    useEffect(() => {
      if (!initialJson && fabricCanvasRef.current) {
        const canvas = fabricCanvasRef.current;
        canvas.clear();
        canvas.backgroundColor = "#fff";
        canvas.requestRenderAll();

        if (initialImageUrl) {
          setIsLoading(true);
          setImageError(false);

          fabric.Image.fromURL(initialImageUrl, {
            crossOrigin: "anonymous",
          }).then((img) => {
            if (!img) {
              setImageError(true);
              setIsLoading(false);
              return;
            }

            const canvasWidth = canvas.width || width;
            const canvasHeight = canvas.height || height;
            const scale = Math.min(
              canvasWidth / (img.width || 1),
              canvasHeight / (img.height || 1)
            );

            img.scale(scale * 0.9);
            img.set({
              originX: "center",
              originY: "center",
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              globalCompositeOperation: "multiply",
              selectable: !readOnly,
              evented: !readOnly,
            });

            canvas.add(img);

            if (initialText) {
              const textbox = new fabric.Textbox(initialText, {
                top: canvasHeight - 100,
                left: canvasWidth / 2,
                originX: "center",
                width: canvasWidth * 0.8,
                fontSize: 24,
                textAlign: "center",
                fill: "#333",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: 10,
                selectable: !readOnly,
                evented: !readOnly,
              });
              canvas.add(textbox);
            }

            canvas.requestRenderAll();
            setIsLoading(false);

            if (onCanvasChange) {
              onCanvasChange(canvas.toJSON());
            }
          }).catch((error) => {
            console.error("加载图片失败:", error);
            setImageError(true);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      }
    }, [initialImageUrl, initialText, initialJson]);

    return (
      <div className="shadow-2xl bg-white rounded-lg overflow-hidden relative">
        <canvas ref={canvasEl} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">加载中...</p>
            </div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-sm">图片加载失败</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
