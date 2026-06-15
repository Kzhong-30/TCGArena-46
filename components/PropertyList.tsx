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

  const handleSort = (value: string) => {
    if (sortBy === value) {
      onSortChange(value, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(value, "desc");
    }
    setShowSortDropdown(false);
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((o) => o.value === sortBy);
    return option ? option.label : "最新发布";
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            page <= 1 || isLoading
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={cn(
                "min-w-10 h-10 px-3 rounded-lg font-medium transition-colors",
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-2 text-gray-400">
              {p}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            page >= totalPages || isLoading
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={HomeIcon}
        title="暂无符合条件的房源"
        description="试试调整筛选条件或搜索其他关键词"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>排序: {getSortLabel()}</span>
            {sortBy !== "createdAt" && sortBy !== "isFeatured" && (
              <span className="text-xs text-gray-500">
                ({sortOrder === "asc" ? "升序" : "降序"})
              </span>
            )}
          </button>

          {showSortDropdown && (
            <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between",
                    sortBy === option.value
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && sortBy !== "createdAt" && sortBy !== "isFeatured" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List className="h-5 w-5" />
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
            showActions={true}
          />
        ))}
      </div>

      {renderPagination()}
    </div>
  );
}
