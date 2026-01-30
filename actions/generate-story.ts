"use server";

import { generateObject, APICallError } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
console.log(process.env.SILICONFLOW_API_KEY)
console.log(process.env.SILICONFLOW_BASE_URL)
console.log(process.env.SILICONFLOW_MODEL)
// 创建硅基流动客户端
const siliconflow = createOpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.com/v1",
});

// 定义我们期望 AI 返回的数据结构 (Schema)
// 这就像是给 AI 填的一张“表格”，它必须填满，不能乱写
const storySchema = z.object({
  title: z.string().describe("根据剧情生成的绘本标题"),
  pages: z
    .array(
      z.object({
        pageNumber: z.number(),
        summary: z
          .string()
          .describe("这一页的剧情梗概，包含主角动作和环境描述"),
      }),
    )
    .length(8), // 强制要求生成 8 页
});

// 定义配置参数接口
export interface GenerateOutlineConfig {
  userInput: string;
  targetAudience?: string;
  mainCharacterDesc?: string;
  stylePrompt?: string;
}

export async function generateOutlineAction(config: string | GenerateOutlineConfig) {
  "use server";

  // 兼容旧的调用方式（只传字符串）
  const params = typeof config === "string"
    ? { userInput: config }
    : config;

  const { userInput, targetAudience = "3-6", mainCharacterDesc = "", stylePrompt = "" } = params;

  console.log("正在生成大纲，用户输入:", userInput);
  console.log("目标年龄:", targetAudience);
  console.log("主角描述:", mainCharacterDesc);

  console.log('model', siliconflow.languageModel)

  try {
    const { object } = await generateObject({
      model: siliconflow.chat(
        process.env.SILICONFLOW_MODEL! || "gpt-3.5-turbo",
      ), // 或者 'gpt-3.5-turbo' (便宜点)
      schema: storySchema,
      prompt: `
        你是一位专业的儿童绘本作家。请根据用户的创意："${userInput}"，创作一个适合 ${targetAudience} 岁儿童阅读的绘本大纲。

        ${mainCharacterDesc ? `**主角设定**: ${mainCharacterDesc}\n请确保主角在整个故事中保持一致。` : ""}

        ${stylePrompt ? `**艺术风格**: ${stylePrompt}\n请在场景描述中考虑这种风格的视觉特点。` : ""}

        要求：
        1. 故事要有起承转合，结局温馨。
        2. 将故事拆分为严格的 8 个画面场景。
        3. 不要直接写对白，而是描述画面发生了什么 (例如：'小猫在雨中哭泣' 而不是 '小猫说：我好难过')。
        4. 每一页的描述应该足够具体，便于后续生成图片。
      `,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("AI 生成失败:", error);
    if (APICallError.isInstance(error)) {
      console.log("具体错误信息:", error);
    }
    return { success: false, error: "生成失败，请重试" };
  }
}
