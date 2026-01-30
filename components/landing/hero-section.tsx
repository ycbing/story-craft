import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowDown, BookOpen, Palette } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-orange-100/20 to-yellow-100/30 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10" />

      {/* 主内容 */}
      <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 左侧：文字内容 */}
          <div className="space-y-6">
            {/* Logo + 图标 */}
            <div className="flex justify-center md:justify-start">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* 主标题 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center md:text-left">
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                AI 儿童绘本
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-100">创作平台</span>
            </h1>

            {/* 副标题 */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed text-center md:text-left">
              让想象力飞翔，用 AI 创造独一无二的儿童绘本。
              从创意到成品，只需几分钟。
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-lg px-8"
                asChild
              >
                <Link href="/create">
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始创作
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950 text-lg px-8"
                asChild
              >
                <Link href="#process">
                  了解流程
                  <ArrowDown className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* 右侧：视觉展示 */}
          <div className="relative">
            {/* 绘本预览卡片组 */}
            <div className="relative grid grid-cols-2 gap-4 max-w-md mx-auto">
              {/* 示例绘本封面 */}
              <Card className="overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-amber-600 dark:text-amber-300" />
                </div>
              </Card>

              {/* 第二本 */}
              <Card className="overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 flex items-center justify-center">
                  <Palette className="w-24 h-24 text-blue-600 dark:text-blue-300" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
