"use server";

import { callZhipuChat } from "@/lib/zhipu";

// 定义配置参数接口
export interface GenerateOutlineConfig {
  userInput: string;
  targetAudience?: string;
  mainCharacterDesc?: string;
  stylePrompt?: string;
}

// 定义返回的数据结构
export interface StoryPage {
  pageNumber: number;
  summary: string;
}

export interface StoryOutline {
  title: string;
  pages: StoryPage[];
}

export async function generateOutlineAction(config: string | GenerateOutlineConfig) {
  "use server";

  const params = typeof config === "string"
    ? { userInput: config }
    : config;

  const { userInput, targetAudience = "3-6", mainCharacterDesc = "", stylePrompt = "" } = params;

  console.log("正在生成大纲，用户输入:", userInput);
  console.log("目标年龄:", targetAudience);
  console.log("主角描述:", mainCharacterDesc);

  try {
    const systemPrompt = `你是一位专业的儿童绘本作家。请根据用户的创意创作绘本大纲。

${mainCharacterDesc ? `**主角设定**: ${mainCharacterDesc}\n请确保主角在整个故事中保持一致。` : ""}

${stylePrompt ? `**艺术风格**: ${stylePrompt}\n请在场景描述中考虑这种风格的视觉特点。` : ""}

要求：
1. 故事要有起承转合，结局温馨。
2. 将故事拆分为严格的 8 个画面场景。
3. 不要直接写对白，而是描述画面发生了什么 (例如：'小猫在雨中哭泣' 而不是 '小猫说：我好难过')。
4. 每一页的描述应该足够具体，便于后续生成图片。

**重要**：请只返回 JSON 格式，不要包含任何其他文字。格式如下：
{
  "title": "绘本标题",
  "pages": [
    {"pageNumber": 1, "summary": "第一页剧情描述"},
    {"pageNumber": 2, "summary": "第二页剧情描述"},
    ...
  ]
}`;

    const text = await callZhipuChat(
      [{ role: "user", content: userInput }],
      systemPrompt
    );

    console.log("AI 原始响应:", text);

    // 尝试从响应中提取 JSON
    let jsonText = text.trim();

    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    console.log("提取的 JSON 文本:", jsonText);

    let parsed: StoryOutline;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON 解析失败:", parseError);
      console.error("尝试解析的文本:", jsonText);
      return {
        success: false,
        error: "AI 返回格式不正确，请重试",
        rawResponse: text,
      };
    }

    if (!parsed.title || !Array.isArray(parsed.pages) || parsed.pages.length !== 8) {
      console.error("数据结构验证失败:", parsed);
      return {
        success: false,
        error: "AI 返回的数据不完整，请重试",
        parsed,
      };
    }

    const pages = parsed.pages.map((page, index) => ({
      pageNumber: page.pageNumber || index + 1,
      summary: page.summary || "",
    }));

    console.log("成功生成大纲:", { title: parsed.title, pages });

    return {
      success: true,
      data: {
        title: parsed.title,
        pages,
      },
    };
  } catch (error) {
    console.error("AI 生成失败:", error);

    let errorMessage = "生成失败，请重试";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("错误堆栈:", error.stack);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
