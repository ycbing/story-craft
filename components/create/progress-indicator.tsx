import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
  completedPages: number[];
  onPageClick?: (page: number) => void;
  className?: string;
}

export function ProgressIndicator({
  currentPage,
  totalPages,
  completedPages,
  onPageClick,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
        const isCurrent = pageNum === currentPage + 1;
        const isCompleted = completedPages.includes(pageNum);

        return (
          <button
            key={pageNum}
            onClick={() => onPageClick?.(pageNum - 1)}
            disabled={!onPageClick}
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all",
              "border-2",
              isCurrent && "border-amber-500 bg-amber-50 text-amber-700 scale-110 shadow-md",
              !isCurrent &&
                isCompleted &&
                "border-green-500 bg-green-50 text-green-700 hover:border-green-600 hover:bg-green-100",
              !isCurrent &&
                !isCompleted &&
                "border-gray-300 bg-white text-gray-400 hover:border-amber-300 hover:bg-amber-50",
              onPageClick && !isCurrent && "cursor-pointer",
              !onPageClick && "cursor-default"
            )}
            title={`第 ${pageNum} 页${isCompleted ? " (已完成)" : isCurrent ? " (当前页)" : ""}`}
          >
            {isCompleted && !isCurrent ? (
              <Check className="w-4 h-4" />
            ) : (
              <span>{pageNum}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
