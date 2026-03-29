"use server";

import { callZhipuImage, enhanceImagePrompt } from "@/lib/zhipu";

interface GenerateImageParams {
  sceneSummary: string;
  stylePreset?: string;
  characterDesc?: string;
  pageNumber?: number;
}

export async function generateImageAction({
  sceneSummary,
  stylePreset = "Children's book illustration, soft colors, whimsical style",
  characterDesc = "",
  pageNumber = 1,
}: GenerateImageParams) {
  "use server";

  console.log("正在生成图片，场景:", sceneSummary);

  try {
    // 第一步：用 GLM-4 优化提示词
    console.log("正在优化提示词...");
    const enhancedPrompt = await enhanceImagePrompt({
      sceneSummary,
      stylePreset,
      characterDesc,
      pageNumber,
    });

    console.log("优化后的提示词:", enhancedPrompt.substring(0, 200) + "...");

    // 第二步：用优化后的提示词生成图片
    const imageUrl = await callZhipuImage(enhancedPrompt);

    console.log("图片生成成功:", imageUrl);

    return {
      success: true,
      imageUrl,
      revisedPrompt: enhancedPrompt,
    };
  } catch (error) {
    console.error("图片生成失败:", error);

    let errorMessage = "图片生成失败，可能是内容触发了安全审核或服务繁忙。";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("错误详情:", error.stack);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
