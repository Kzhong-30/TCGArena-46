"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export default function Pagination({ currentPage, totalPages, totalItems, pageSize }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-gray-500">
        显示 <span className="font-medium text-gray-900">{startItem}</span> -{" "}
        <span className="font-medium text-gray-900">{endItem}</span> 条，共{" "}
        <span className="font-medium text-gray-900">{totalItems}</span> 条
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
            currentPage === 1
              ? "text-gray-300 bg-gray-50 cursor-not-allowed border-gray-200"
              : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一页
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && goToPage(page)}
            disabled={page === "..."}
            className={cn(
              "min-w-10 h-10 text-sm font-medium rounded-lg border transition-colors",
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : page === "..."
                ? "text-gray-400 bg-transparent border-transparent cursor-default"
                : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
            currentPage === totalPages
              ? "text-gray-300 bg-gray-50 cursor-not-allowed border-gray-200"
              : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
          )}
        >
          下一页
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
