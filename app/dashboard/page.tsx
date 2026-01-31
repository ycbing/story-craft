"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBooksAction, deleteBookAction } from "@/actions/get-books";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, CheckCircle2, Trash2, Edit3, Plus, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface BookListItem {
  id: string;
  title: string;
  status: "draft" | "completed";
  coverUrl: string | null;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
  stylePrompt: string | null;
  mainCharacterDesc: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    const result = await getBooksAction();
    if (result.success) {
      setBooks(result.data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("确定要删除这个绘本吗？此操作无法撤销。")) {
      return;
    }

    const result = await deleteBookAction(bookId);
    if (result.success) {
      toast.success("绘本已删除");
      loadBooks();
    } else {
      toast.error(result.error || "删除失败");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                我的作品
              </h1>
            </div>
            <p className="text-gray-600 ml-14">
              管理和继续创作你的绘本
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
          >
            <Link href="/create">
              <Plus className="w-5 h-5 mr-2" />
              创建新绘本
            </Link>
          </Button>
        </div>

        {/* 加载状态 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        ) : (
          /* 绘本列表 */
          books.length === 0 ? (
            // 空状态
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
                    开始你的第一个绘本创作之旅吧！
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-amber-100 hover:border-amber-300 bg-white"
                >
                  {/* 封面区域 */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 relative">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-24 h-24 text-amber-400" />
                      </div>
                    )}

                    {/* 状态标签 */}
                    <div className="absolute top-4 right-4">
                      {book.status === "completed" ? (
                        <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm shadow">
                          <CheckCircle2 className="w-4 h-4" />
                          已完成
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full text-sm shadow">
                          <Clock className="w-4 h-4" />
                          草稿
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 信息区域 */}
                  <div className="p-5 space-y-4">
                    {/* 标题 */}
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                      {book.title}
                    </h3>

                    {/* 元数据 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{book.pageCount} 页</span>
                      </div>
                      <span>{formatDate(book.updatedAt)}</span>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        <Link href={`/create/editor?bookId=${book.id}`}>
                          <Edit3 className="w-4 h-4 mr-1" />
                          {book.status === "completed" ? "查看" : "继续编辑"}
                        </Link>
                      </Button>
                      <Button
                        onClick={() => handleDelete(book.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
