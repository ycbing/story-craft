// 智谱 GLM API 调用封装
const ZHIPU_API_KEY = "6d71bd03d31b4bddbaa340ab01f56035.SxjuGfZg2CHpI75h";
const ZHIPU_CHAT_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_IMAGE_URL = "https://open.bigmodel.cn/api/paas/v4/images/generations";

export async function callZhipuChat(
  messages: Array<{ role: string; content: string }>,
  system: string = ""
): Promise<string> {
  const allMessages = system
    ? [{ role: "system", content: system }, ...messages]
    : messages;

  const res = await fetch(ZHIPU_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZHIPU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: allMessages,
      temperature: 0.8,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("智谱 API 错误:", res.status, errorText);
    throw new Error(`智谱 API 调用失败: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

/**
 * 用 GLM-4 优化图片生成提示词
 * 先让大模型把简单的场景描述扩展为专业的、细节丰富的英文 prompt
 */
export async function enhanceImagePrompt(params: {
  sceneSummary: string;
  stylePreset: string;
  characterDesc: string;
  pageNumber: number;
}): Promise<string> {
  const { sceneSummary, stylePreset, characterDesc, pageNumber } = params;

  const enhancePrompt = `你是一位专业的 AI 绘本插画 prompt 工程师。请将以下绘本场景描述扩展为一段高质量的英文图片生成提示词。

## 风格
${stylePreset}

## 主角描述（必须在每页保持一致）
${characterDesc || "未指定，请设计一个可爱的主角"}

## 第 ${pageNumber} 页场景
${sceneSummary}

## 要求
1. 生成一段 100-180 词的英文 prompt
2. 只描述温馨、安全的画面内容：
   - ✅ 可以：动物角色、自然风景、温馨互动、阅读、绘画、建造、种植、游戏
   - ❌ 避免：武器、机械装置、飞行器、战争、暴力、危险场景
3. 包含：画面构图、角色动作和表情、背景环境、色彩氛围、画面情绪
4. 角色外貌描述要具体（年龄、发型、服装颜色）
5. 避免出现文字、标识、水印
6. 用 children's picture book illustration 作为风格前缀
7. 用词要简单柔和，适合儿童绘本的温馨感觉

只输出英文 prompt，不要解释。`;

  const enhancedPrompt = await callZhipuChat(
    [{ role: "user", content: `Scene: ${sceneSummary}\nStyle: ${stylePreset}\nCharacter: ${characterDesc}` }],
    enhancePrompt,
  );

  return enhancedPrompt.trim();
}

/**
 * 生成绘本图片（带重试和安全降级）
 * 如果被内容安全审核拦截，自动简化 prompt 重试
 */
export async function callZhipuImage(prompt: string): Promise<string> {
  // 第一次尝试：原始 prompt
  try {
    return await _fetchImage(prompt);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "";
    const isContentFilter = errMsg.includes("1301") || errMsg.includes("内容安全");

    if (!isContentFilter) {
      throw error; // 不是内容审核问题，直接抛出
    }

    console.log("内容安全拦截，尝试简化 prompt 重试...");

    // 第二次尝试：去掉具体描述，只保留核心元素
    const simplified = prompt
      .replace(/[;|.][^,]*weapon[^,]*/gi, "")
      .replace(/[;|.][^,]*machine[^,]*/gi, "")
      .replace(/[;|.][^,]*flying[^,]*/gi, "")
      .replace(/[;|.][^,]*rocket[^,]*/gi, "")
      .replace(/[;|.][^,]*explosion[^,]*/gi, "")
      .replace(/[;|.][^,]*war[^,]*/gi, "")
      .replace(/[;|.][^,]*fight[^,]*/gi, "")
      .replace(/[;|.][^,]*danger[^,]*/gi, "")
      .trim();

    try {
      return await _fetchImage(simplified);
    } catch {
      console.log("简化重试也失败，使用极简 prompt...");
    }

    // 第三次尝试：极简 prompt，只保留风格和角色
    const minimal = `children's picture book illustration, warm colors, cute animal character, happy scene, simple background, hand-drawn style`;

    return await _fetchImage(minimal);
  }
}

async function _fetchImage(prompt: string): Promise<string> {
  const res = await fetch(ZHIPU_IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZHIPU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "cogview-3-flash",
      prompt,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("智谱图片 API 错误:", res.status, errorText);
    throw new Error(`智谱图片 API 调用失败: ${res.status} ${errorText.substring(0, 200)}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("智谱 API 未返回图片 URL");
  }
  return imageUrl;
}
