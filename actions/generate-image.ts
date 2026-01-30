"use server";

import OpenAI from "openai";

// 初始化 OpenAI 客户端 (直接使用官方 SDK，对 DALL-E 支持最稳定)
const openai = new OpenAI({
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
    // 1. 组装“提示词三明治”
    // 技巧：DALL-E 3 对自然语言理解很好，我们将不同要素组合成一段描述
    const finalPrompt = `
      Illustration style: ${stylePreset}.
      Scene description: ${sceneSummary}.
      Key character visual details (MUST stay consistent): ${characterDesc}.
      Atmosphere: warm, storybook feel, detailed background lighting.
    `.trim();

    console.log("最终提示词:", finalPrompt);

    // 2. 调用 DALL-E 3 API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1, // 生成 1 张
      size: "1024x1024", // 标准方形
      quality: "standard", // "hd" 更贵但细节更好，MVP先用 standard
      response_format: "url",
    });

    const imageUrl = response.data[0].url;

    if (!imageUrl) throw new Error("未返回图片 URL");

    return { success: true, imageUrl };
  } catch (error) {
    console.error("图片生成失败:", error);
    // 实际项目中这里应该区分错误类型 (比如由内容审核引起的拒绝)
    return {
      success: false,
      error: "图片生成失败，可能是内容触发了安全审核或服务繁忙。",
    };
  }
}
