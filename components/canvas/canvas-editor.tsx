"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import * as fabric from "fabric"; // 确保安装的是 fabric v6

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
    const [isReady, setIsReady] = useState(false); // 标记 Canvas 是否初始化完成
    const [isLoading, setIsLoading] = useState(true);

    // 暴露方法
    useImperativeHandle(ref, () => ({
      saveToJson: () => {
        if (!fabricCanvasRef.current) return null;
        return fabricCanvasRef.current.toJSON();
      },
      getCanvas: () => fabricCanvasRef.current,
    }));

    // 1. 初始化 Fabric Canvas 引擎 (仅在挂载时执行一次)
    useEffect(() => {
      if (!canvasEl.current) return;

      console.log("初始化 Fabric 引擎...");
      const canvas = new fabric.Canvas(canvasEl.current, {
        width,
        height,
        backgroundColor: "#fff",
        selection: !readOnly,
        renderOnAddRemove: false, // 性能优化：关闭自动渲染，手动 requestRenderAll
      });

      // 修复只读模式的光标
      if (readOnly) {
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "default";
      }

      fabricCanvasRef.current = canvas;
      setIsReady(true); // 标记引擎就绪

      // 绑定事件
      const handleChange = () => {
        if (!readOnly && onCanvasChange) {
          onCanvasChange(canvas.toJSON());
        }
      };

      canvas.on("object:modified", handleChange);
      canvas.on("object:added", handleChange);
      canvas.on("object:removed", handleChange);

      // 清理函数
      return () => {
        console.log("清理 Fabric 引擎...");
        canvas.off("object:modified", handleChange);
        canvas.off("object:added", handleChange);
        canvas.off("object:removed", handleChange);
        
        // Fabric v6 dispose 是异步的，但 useEffect cleanup 是同步的
        // 这里主要为了断开引用，具体 DOM 清理由 React 处理，
        // 或者使用 dispose().then() 但要注意不要阻塞 UI
        canvas.dispose(); 
        fabricCanvasRef.current = null;
        setIsReady(false);
      };
    }, []); // 空依赖数组，确保只运行一次

    // 2. 加载内容 (当 Canvas 就绪 或 数据变化时执行)
    useEffect(() => {
      if (!isReady || !fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      setIsLoading(true);

      const loadContent = async () => {
        try {
          canvas.clear();
          canvas.backgroundColor = "#fff"; // 清除后重置背景
          
          // A. 优先加载 JSON 存档
          if (initialJson) {
            console.log("加载 JSON...");
            // 🔥 v6 修复：loadFromJSON 返回 Promise
            await canvas.loadFromJSON(initialJson);
            
            // 恢复特殊属性
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "image") {
                // @ts-ignore: fabric v6 类型可能需要断言
                obj.globalCompositeOperation = "multiply";
              }
              if (readOnly) {
                obj.selectable = false;
                obj.evented = false;
              }
            });
          } 
          // B. 加载新素材
          else if (initialImageUrl) {
            console.log("加载新素材...");
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(initialImageUrl)}`;
            
            // 🔥 v6 修复：使用 await 并且没有 callback
            const img = await fabric.Image.fromURL(proxyUrl, {
              crossOrigin: "anonymous",
            });

            if (img) {
              const canvasWidth = canvas.width || width;
              const canvasHeight = canvas.height || height;
              // 计算 cover 模式的缩放
              const scaleX = canvasWidth / img.width!;
              const scaleY = canvasHeight / img.height!;
              const scale = Math.max(scaleX, scaleY); // Cover 模式用 max, Contain 用 min

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
              
              // 图片置底
              canvas.add(img);
              canvas.sendObjectToBack(img);
            }

            // 添加文字
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
                splitByGrapheme: true, // 中文换行支持
              });
              canvas.add(textbox);
              canvas.setActiveObject(textbox);
            }
          }

          canvas.requestRenderAll();
        } catch (err) {
          console.error("加载内容失败:", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadContent();

    }, [isReady, initialJson, initialImageUrl, initialText, readOnly, width, height]);

    return (
      <div className={`shadow-2xl bg-white rounded-lg overflow-hidden relative ${className}`}>
        {/* Fabric 会在 canvas 标签外包一层 div，我们只需渲染 canvas */}
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