// 绘本风格预设
export interface StylePreset {
  value: string;
  label: string;
  prompt: string;
  description: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    value: "ghibli",
    label: "吉卜力风格",
    description: "宫崎骏动画风格，温暖治愈",
    prompt: "Studio Ghibli anime style, watercolor texture, soft colors, lush backgrounds, whimsical and nostalgic atmosphere",
  },
  {
    value: "watercolor",
    label: "水彩画",
    description: "传统水彩插画，柔和温馨",
    prompt: "Watercolor illustration, soft edges, pastel colors, hand-painted texture, gentle and dreamy atmosphere",
  },
  {
    value: "pixar",
    label: "皮克斯风格",
    description: "3D动画风格，活泼可爱",
    prompt: "Pixar 3D animation style, vibrant colors, cute characters, expressive faces, clean and polished look",
  },
  {
    value: "picture-book",
    label: "经典绘本",
    description: "传统儿童绘本风格",
    prompt: "Classic children's book illustration, hand-drawn style, warm colors, simple and clear composition",
  },
  {
    value: "pixel-art",
    label: "像素艺术",
    description: "复古游戏像素风格",
    prompt: "Pixel art style, retro game aesthetic, limited color palette, blocky and charming details",
  },
  {
    value: "chinese-ink",
    label: "中国水墨",
    description: "传统水墨画风格",
    prompt: "Chinese ink painting style, brush strokes, minimalist, elegant, negative space, traditional aesthetic",
  },
  {
    value: "disney",
    label: "迪士尼风格",
    description: "经典迪士尼动画风格",
    prompt: "Disney animation style, vibrant colors, expressive characters, magical and enchanting atmosphere",
  },
];

// 目标年龄段预设
export interface AgePreset {
  value: string;
  label: string;
  description: string;
}

export const AGE_PRESETS: AgePreset[] = [
  {
    value: "3-6",
    label: "3-6 岁",
    description: "学龄前儿童，简单易懂的故事",
  },
  {
    value: "6-9",
    label: "6-9 岁",
    description: "小学低年级，稍微复杂的情节",
  },
  {
    value: "9-12",
    label: "9-12 岁",
    description: "小学高年级，更丰富的故事内容",
  },
];
