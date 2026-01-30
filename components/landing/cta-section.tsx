import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-950/30 rounded-3xl p-12 md:p-16 text-center shadow-xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          准备好创作你的
          <span className="block mt-2 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
            第一本绘本了吗？
          </span>
        </h2>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          让 AI 帮你实现创意，几分钟内完成专业品质的儿童绘本
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg text-xl px-12 py-6"
          asChild
        >
          <Link href="/create">
            <Sparkles className="w-6 h-6 mr-2" />
            立即开始创作
          </Link>
        </Button>
      </div>
    </section>
  );
}
