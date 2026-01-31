"use server";

import { generateText, APICallError } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// 创建心流客户端
const iflow = createOpenAI({
  apiKey: process.env.IFLOW_API_KEY,
  baseURL: process.env.IFLOW_BASE_URL || "https://api.siliconflow.com/v1",
});

// 定义输入参数类型
export interface RefinePageTextParams {
  originalSummary: string;
  pageNumber: number;
  bookTitle: string;
  stylePrompt?: string;
  targetAudience?: string;
}

export async function refinePageTextAction({
  originalSummary,
  pageNumber,
  bookTitle,
  stylePrompt = "Classic children's book illustration, hand-drawn style",
  targetAudience = "3-6",
}: RefinePageTextParams) {
  "use server";

  console.log(`正在润色第 ${pageNumber} 页文案:`, originalSummary);

  try {
    const { text } = await generateText({
      model: iflow.chat(
        process.env.IFLOW_MODEL! || "gpt-3.5-turbo",
      ),
      prompt: `你是一位专业的儿童绘本作家。

请根据以下信息，为绘本的第 ${pageNumber} 页创作完整的文案：

**绘本标题**: 《${bookTitle}》
**目标年龄**: ${targetAudience} 岁
**场景摘要**: ${originalSummary}
**艺术风格**: ${stylePrompt}

**要求**:
1. 文案要简洁优美，适合朗读
2. 字数控制在 50-100 字之间
3. 语言要符合目标年龄段的理解能力
4. 保持故事的连贯性和温馨感
5. 不要直接写对白，而是用描述性语言
6. 为画面提供足够的细节描述

请直接返回文案，不要加任何前缀或后缀。`,
    });

    return { success: true, refinedText: text.trim() };
  } catch (error) {
    console.error("文案润色失败:", error);
    if (APICallError.isInstance(error)) {
      console.log("具体错误信息:", error);
    }
    return { success: false, error: "文案生成失败，请重试" };
  }
}
