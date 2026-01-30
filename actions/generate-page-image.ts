"use server";

import { generateImageAction } from "./generate-image";

// 定义输入参数类型
export interface GeneratePageImageParams {
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

  // 组合场景描述：使用润色后的文案作为主要描述，同时保留原始摘要作为参考
  const sceneDescription = `${refinedText}\n\nAdditional context: ${originalSummary}`;

  // 调用现有的 generateImageAction
  const result = await generateImageAction({
    sceneSummary: sceneDescription,
    stylePreset: stylePrompt,
    characterDesc: mainCharacterDesc,
  });

  if (result.success) {
    // 返回成功结果，包含组装的提示词供用户查看
    const revisedPrompt = `
Illustration style: ${stylePrompt}.
Scene description: ${sceneDescription}.
Key character visual details (MUST stay consistent): ${mainCharacterDesc}.
Atmosphere: warm, storybook feel, detailed background lighting.
    `.trim();

    return {
      success: true,
      imageUrl: result.imageUrl,
      revisedPrompt,
    };
  }

  // 返回失败结果
  return {
    success: false,
    error: result.error,
  };
}
