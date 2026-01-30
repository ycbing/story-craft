import { Lightbulb, FileCheck, Edit, BookOpen } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      icon: Lightbulb,
      title: "输入创意",
      description: "描述你的故事想法，选择风格和年龄段",
    },
    {
      icon: FileCheck,
      title: "确认大纲",
      description: "AI 生成 8 页故事大纲，确认或调整内容",
    },
    {
      icon: Edit,
      title: "逐页编辑",
      description: "为每页生成文案、配图，精细调整画面",
    },
    {
      icon: BookOpen,
      title: "完成绘本",
      description: "预览最终效果，导出你的专属绘本",
    },
  ];

  return (
    <section id="process" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          四步完成绘本创作
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          简单直观的流程，让创作变得轻松愉快
        </p>
      </div>

      <div className="relative">
        {/* 连接线 */}
        <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 dark:from-amber-800 dark:via-amber-600 dark:to-amber-800" />

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center space-y-4">
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform duration-300">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-white dark:bg-gray-800 px-4 py-1 rounded-full shadow-md border-2 border-amber-200 dark:border-amber-700">
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">{index + 1}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
