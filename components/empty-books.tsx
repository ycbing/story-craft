"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";

export function EmptyBooks() {
  return (
    <Card className="p-16 text-center border-2 border-dashed border-amber-200 bg-white/50">
      <div className="flex flex-col items-center space-y-6">
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-8 rounded-full">
          <BookOpen className="w-16 h-16 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-700">
            还没有绘本
          </h3>
          <p className="text-gray-500">
            开始你的第一个绘本创作之旅吧！AI 将帮助你从灵感到成品。
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
        >
          <Link href="/create">
            <Sparkles className="w-5 h-5 mr-2" />
            创建第一个绘本
          </Link>
        </Button>
      </div>
    </Card>
  );
}
