import Link from "next/link";
import { Sparkles, Library } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-amber-100 dark:border-amber-900/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo 和品牌名 */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
              Story Craft
            </span>
          </Link>

          {/* 链接组 */}
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors text-sm flex items-center gap-1"
            >
              <Library className="w-3 h-3" />
              我的作品
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors text-sm"
            >
              功能特点
            </Link>
            <Link
              href="#process"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors text-sm"
            >
              创作流程
            </Link>
            <Link
              href="#styles"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors text-sm"
            >
              艺术风格
            </Link>
          </nav>

          {/* 版权声明 */}
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2025 Story Craft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
