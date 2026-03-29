"use server";

import { callZhipuImage, enhanceImagePrompt } from "@/lib/zhipu";

interface GeneratePageImageParams {
  refinedText: string;
  originalSummary: string;
  stylePrompt: string;
  mainCharacterDesc: string;
  pageNumber: number;
}

export async function generatePageImageAction({
  refinedText,
  originalSummary,
  stylePrompt,
  mainCharacterDesc,
  pageNumber,
}: GeneratePageImageParams) {
  "use server";

  console.log(`正在生成第 ${pageNumber} 页图片`);

  try {
    // 合并润色后文案和原始摘要作为场景描述
    const sceneDescription = `${refinedText}\n\nAdditional context: ${originalSummary}`;

    // 用 GLM-4 优化提示词
    const enhancedPrompt = await enhanceImagePrompt({
      sceneSummary: sceneDescription,
      stylePreset: stylePrompt,
      characterDesc: mainCharacterDesc,
      pageNumber,
    });

    console.log("优化后的提示词:", enhancedPrompt.substring(0, 200) + "...");

    // 生成图片
    const imageUrl = await callZhipuImage(enhancedPrompt);

    return {
      success: true,
      imageUrl,
      revisedPrompt: enhancedPrompt,
    };
  } catch (error) {
    console.error("图片生成失败:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "图片生成失败",
    };
  }
}
