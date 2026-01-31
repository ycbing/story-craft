"use server";

import { createOpenAI } from "@ai-sdk/openai";

// 初始化智谱客户端
const zai = createOpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: process.env.ZAI_BASE_URL,
});

// 定义输入参数类型
interface GenerateImageParams {
  sceneSummary: string; // 这一页发生了什么 (来自大纲)
  stylePreset?: string; // 风格预设
  characterDesc?: string; // 主角描述
}

export async function generateImageAction({
  sceneSummary,
  stylePreset = "Children's book illustration, soft colors, whimsical style",
  characterDesc = "",
}: GenerateImageParams) {
  "use server";

  console.log("正在生成图片，场景:", sceneSummary);

  try {
    // 1. 组装提示词
    const finalPrompt = `
      Illustration style: ${stylePreset}.
      Scene description: ${sceneSummary}.
      Key character visual details (MUST stay consistent): ${characterDesc}.
      Atmosphere: warm, storybook feel, detailed background lighting.
    `.trim();

    console.log("最终提示词:", finalPrompt);

    // 2. 直接调用智谱图片生成 API
    const response = await fetch(`${process.env.ZAI_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ZAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || "cogview-3-flash",
        prompt: finalPrompt,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 响应错误:", response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("API 响应数据:", data);

    // 3. 提取图片 URL
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error("响应中未找到图片 URL:", data);
      throw new Error("未返回图片 URL");
    }

    console.log("图片生成成功:", imageUrl);

    return { success: true, imageUrl, revisedPrompt: finalPrompt };
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
