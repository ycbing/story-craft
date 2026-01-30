import { Card } from "@/components/ui/card";
import { Sparkles, Palette, Edit3 } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI 智能创作",
      description: "输入简单创意，AI 自动生成 8 页完整故事大纲，无需从头构思",
    },
    {
      icon: Palette,
      title: "多样艺术风格",
      description: "7 种专业艺术风格可选，从吉卜力到迪士尼，满足不同审美需求",
    },
    {
      icon: Edit3,
      title: "逐页精细编辑",
      description: "文案、配图、画布全方位编辑，打造完全个性化的绘本作品",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          为什么选择 Story Craft？
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          简单易用，专业品质，让每个人都能创作出精美的儿童绘本
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-t-amber-500 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
