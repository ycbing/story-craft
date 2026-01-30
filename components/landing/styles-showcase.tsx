import { Card } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { STYLE_PRESETS } from "@/lib/constants/style-presets";

export function StylesShowcase() {
  return (
    <section id="styles" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          7 种艺术风格
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          选择你喜欢的风格，创作独一无二的绘本
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {STYLE_PRESETS.map((style) => (
          <Card
            key={style.value}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer"
          >
            <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-6 group-hover:from-amber-100 group-hover:to-orange-100 dark:group-hover:from-amber-900/20 dark:group-hover:to-orange-900/20 transition-colors">
              <Palette className="w-16 h-16 text-amber-400 dark:text-amber-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                {style.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {style.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
