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

export default function PropertyList() {
  return <div>Test</div>;
}
