"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as fabric from "fabric";

interface CanvasEditorProps {
  initialImageUrl: string | null;
  initialText: string;
  initialJson?: any; // 新增：如果之前存过 JSON，就加载 JSON，不加载图片文字
}

// 定义暴露给父组件的方法
export interface CanvasEditorRef {
  saveToJson: () => any; // 这是一个函数，返回 JSON 对象
}

// 使用 forwardRef 包裹组件
const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(
  ({ initialImageUrl, initialText, initialJson }, ref) => {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    // 🔥 暴露 save 方法给父组件
    useImperativeHandle(ref, () => ({
      saveToJson: () => {
        if (!fabricCanvasRef.current) return null;
        console.log("正在保存画布状态...");
        return fabricCanvasRef.current.toJSON();
      },
    }));

    useEffect(() => {
      if (!canvasEl.current) return;

      // 防止重复初始化 (React Strict Mode 问题)
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }

      const canvas = new fabric.Canvas(canvasEl.current, {
        width: 800,
        height: 600,
        backgroundColor: "#fff",
      });
      fabricCanvasRef.current = canvas;

      // --- 逻辑分支：加载旧存档 vs 加载新素材 ---
      if (initialJson) {
        // A. 如果有存档，直接加载 JSON (比如从第2页切回第1页)
        console.log("加载已有 JSON 存档...");
        canvas.loadFromJSON(initialJson, () => {
          canvas.requestRenderAll();
          // 恢复正片叠底等特殊属性 (Fabric loadFromJSON 有时会丢混合模式，需注意)
          canvas.getObjects().forEach((obj: any) => {
            if (obj.type === "image") obj.globalCompositeOperation = "multiply";
          });
        });
      } else if (initialImageUrl) {
        // B. 如果是新页面，加载 AI 图片和文字
        console.log("加载 AI 新素材...");
        // ... (这里保留你之前的加载图片和文字的代码) ...
        // 为了节省篇幅，这里简写逻辑：
        fabric.Image.fromURL(
          initialImageUrl,
          (img) => {
            if (!img) return;
            // ...设置 scale, center, globalCompositeOperation...
            // ...canvas.add(img)...
            // 记得把这段逻辑补全，或者直接复用上一步的代码
            // 这里的关键是确保 fabricCanvasRef.current = canvas
          },
          { crossOrigin: "anonymous" },
        );

        const textbox = new fabric.Textbox(initialText || "点击编辑文字", {
          // ...配置...
          top: 500,
          left: 400,
          originX: "center",
          width: 600,
          fontSize: 24,
          textAlign: "center",
        });
        canvas.add(textbox);
      }

      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [initialImageUrl, initialText, initialJson]); // 依赖项变化时重新初始化

    return (
      <div className="shadow-2xl bg-white">
        <canvas ref={canvasEl} />
      </div>
    );
  },
);

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
