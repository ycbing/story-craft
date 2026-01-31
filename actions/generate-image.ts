"use server";

import { generateImage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// 初始化 OpenAI 客户端 (使用 Vercel AI SDK)
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 定义输入参数类型
interface GenerateImageParams {
  sceneSummary: string; // 这一页发生了什么 (来自大纲)
  stylePreset?: string; // 风格预设 (例如: "Studio Ghibli anime style, watercolor texture")
  characterDesc?: string; // 主角描述 (例如: "A small black kitten with big yellow eyes and a red scarf")
}

export async function generateImageAction({
  sceneSummary,
  stylePreset = "Children's book illustration, soft colors, whimsical style", // 默认风格
  characterDesc = "", // 默认无特定角色
}: GenerateImageParams) {
  "use server";

  console.log("正在生成图片，场景:", sceneSummary);

  try {
    // 1. 组装"提示词三明治"
    // 技巧：DALL-E 3 对自然语言理解很好，我们将不同要素组合成一段描述
    const finalPrompt = `
      Illustration style: ${stylePreset}.
      Scene description: ${sceneSummary}.
      Key character visual details (MUST stay consistent): ${characterDesc}.
      Atmosphere: warm, storybook feel, detailed background lighting.
    `.trim();

    console.log("最终提示词:", finalPrompt);

    // 2. 使用 Vercel AI SDK 调用 DALL-E 3 API
    const { image, usage } = await generateImage({
      model: openai.image("dall-e-3"),
      prompt: finalPrompt,
      size: "1024x1024",
      // quality: "standard",
      n: 1,
    });

    console.log("图片生成成功，使用量:", usage);

    // image 对象包含 base64 数据
    const imageUrl = image.base64
      ? `data:image/png;base64,${image.base64}`
      : undefined;

    if (!imageUrl) {
      throw new Error("未返回图片数据");
    }

    return { success: true, imageUrl };
  } catch (error) {
    console.error("图片生成失败:", error);

    // 提取详细的错误信息
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
