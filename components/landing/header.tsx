"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Library } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 dark:border-amber-900/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl shadow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
              Story Craft
            </span>
          </Link>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Library className="w-4 h-4" />
              我的作品
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
            >
              功能特点
            </Link>
            <Link
              href="#process"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
            >
              创作流程
            </Link>
            <Link
              href="#styles"
              className="text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
            >
              艺术风格
            </Link>
          </nav>

          {/* CTA 按钮 */}
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
          >
            <Link href="/create">
              开始创作
              <Sparkles className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
