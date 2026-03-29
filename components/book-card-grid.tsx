"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface BookItem {
  id: string;
  title: string;
  status: string | null;
  coverUrl: string | null;
  createdAt: string | null;
  stylePrompt: string | null;
  pageCount: number;
}

function formatDate(date: string | Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BookCard({ book }: { book: BookItem }) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("确定要删除这个绘本吗？此操作无法撤销。")) return;

    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("绘本已删除");
          router.refresh();
        } else {
          toast.error(data.error || "删除失败");
        }
      } catch {
        toast.error("网络错误，请重试");
      }
    });
  };

  const viewHref =
    book.status === "completed"
      ? `/view/${book.id}`
      : `/create/editor?bookId=${book.id}`;

  return (
    <Link href={viewHref} className="group block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-amber-100 hover:border-amber-300 bg-white py-0 gap-0">
        {/* 封面区域 */}
        <div className="aspect-[3/4] bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 relative overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-amber-400" />
            </div>
          )}

          {/* 状态标签 */}
          <div className="absolute top-3 left-3">
            {book.status === "completed" ? (
              <div className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已完成
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs shadow">
                <Clock className="w-3.5 h-3.5" />
                草稿
              </div>
            )}
          </div>

          {/* 操作按钮 - 右上角 */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <Button
              asChild
              variant="outline"
              size="icon-sm"
              className="bg-white/90 hover:bg-white border-0 shadow-md text-amber-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Link href={viewHref}>
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="bg-white/90 hover:bg-red-50 border-0 shadow-md text-red-500 hover:text-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-amber-700 transition-colors">
            {book.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{book.pageCount} 页</span>
            </div>
            <span>{formatDate(book.createdAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function BookCardGrid({ books }: { books: BookItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
