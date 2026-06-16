"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { PropertyWithDetails } from "@/types";

interface PropertyListProps {
  properties: PropertyWithDetails[];
  total: number;
  page: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const SORT_OPTIONS = [
  { value: "createdAt", label: "最新发布" },
  { value: "isFeatured", label: "精选推荐" },
  { value: "price", label: "价格" },
  { value: "area", label: "面积" },
  { value: "bedrooms", label: "户型" },
];

export default function PropertyList({
  properties,
  total,
  page,
  totalPages,
  sortBy,
  sortOrder,
  viewMode,
  onSortChange,
  onViewModeChange,
  onPageChange,
  isLoading,
}: PropertyListProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSortClick = (value: string) => {
    if (sortBy === value) {
      onSortChange(value, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(value, "desc");
    }
    setShowSortDropdown(false);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "最新发布";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title="暂无房源"
        description="没有找到符合条件的房源，请尝试调整筛选条件"
        icon="Home"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            共找到 <span className="font-semibold text-gray-900">{total}</span>{" "}
            套房源
          </p>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span>{currentSortLabel}</span>
              {sortBy === "price" || sortBy === "area" || sortBy === "bedrooms" ? (
                <span className="text-xs text-gray-500">
                  ({sortOrder === "asc" ? "↑" : "↓"})
                </span>
              ) : null}
            </button>

            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortClick(option.value)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                      sortBy === option.value
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
      >
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            viewMode={viewMode}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page <= 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === page - 2 ||
                  pageNum === page + 2
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="w-10 h-10 flex items-center justify-center text-gray-400"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              }
            )}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page >= totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
