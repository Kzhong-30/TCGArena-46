"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon, Filter, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyFilter from "@/components/PropertyFilter";
import PropertyList from "@/components/PropertyList";
import { cn } from "@/lib/utils";
import type { PropertyWithDetails, PropertyFilters } from "@/types";
import { CITIES } from "@/lib/constants";
import { toast } from "sonner";

const PropertyMap = dynamic(
  () => import("@/components/PropertyMap"),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full min-h-[600px] bg-gray-50 rounded-xl">
      <div className="animate-pulse text-gray-500">加载地图中...</div>
    </div>
  )}
);

interface PropertiesResponse {
  success: boolean;
  data: PropertyWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function PropertiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [listLayoutMode, setListLayoutMode] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const query = searchParams.get("query") || "";
  const city = searchParams.get("city") || CITIES[0].value;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const district = searchParams.get("district") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minArea = searchParams.get("minArea") || "";
  const maxArea = searchParams.get("maxArea") || "";
  const bedrooms = searchParams.get("bedrooms") || "";
  const bathrooms = searchParams.get("bathrooms") || "";
  const orientation = searchParams.get("orientation") || "";
  const amenities = searchParams.get("amenities") || "";

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      if (query) params.set("query", query);
      if (city) params.set("city", city);
      if (district) params.set("district", district);
      if (propertyType) params.set("propertyType", propertyType);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minArea) params.set("minArea", minArea);
      if (maxArea) params.set("maxArea", maxArea);
      if (bedrooms) params.set("bedrooms", bedrooms);
      if (bathrooms) params.set("bathrooms", bathrooms);
      if (orientation) params.set("orientation", orientation);
      if (amenities) params.set("amenities", amenities);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data: PropertiesResponse = await res.json();

      if (data.success) {
        setProperties(data.data);
        setTotal(data.pagination.total);
      } else {
        toast.error("加载房源失败");
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      toast.error("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    query,
    city,
    district,
    propertyType,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    orientation,
    amenities,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      current.delete("page");

      const search = current.toString();
      const queryString = search ? `?${search}` : "";
      router.push(`${pathname}${queryString}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const handleSearch = useCallback(
    (newQuery: string, newCity: string) => {
      updateSearchParams({ query: newQuery, city: newCity, page: null });
    },
    [updateSearchParams]
  );

  const handleFilterChange = useCallback(
    (filters: Partial<PropertyFilters>) => {
      const updates: Record<string, string | null> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          updates[key] = value.join(",");
        } else if (value !== undefined && value !== null) {
          updates[key] = String(value);
        } else {
          updates[key] = null;
        }
      });
      
      updates.page = null;
      updateSearchParams(updates);
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateSearchParams]
  );

  const handleListLayoutChange = useCallback((mode: "grid" | "list") => {
    setListLayoutMode(mode);
  }, []);

  const handleResetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const currentFilters: PropertyFilters = {
    query,
    city,
    district: district || undefined,
    propertyType: propertyType || undefined,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    minArea: minArea ? parseInt(minArea, 10) : undefined,
    maxArea: maxArea ? parseInt(maxArea, 10) : undefined,
    bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
    bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
    orientation: orientation || undefined,
    amenities: amenities ? amenities.split(",") : undefined,
    page,
    limit: 12,
    sortBy,
    sortOrder,
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <SearchBar
              query={query}
              onQueryChange={(value) => updateSearchParams({ query: value || null })}
              city={city}
              onCityChange={(value) => updateSearchParams({ city: value, page: null })}
              onSearch={() => {}}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>筛选</span>
                </button>

                <p className="text-sm text-gray-500 hidden sm:block">
                  共找到{" "}
                  <span className="font-semibold text-gray-900">
                    {total.toLocaleString()}
                  </span>{" "}
                  套房源
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-md transition-colors flex items-center gap-2",
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">列表</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "p-2 rounded-md transition-colors flex items-center gap-2",
                    viewMode === "map"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <MapIcon className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">地图</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  重置
                </button>
              </div>
              <PropertyFilter
                filters={currentFilters}
                onChange={handleFilterChange}
              />
            </div>
          </aside>

          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                  <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      重置
                    </button>
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <PropertyFilter
                    filters={currentFilters}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    查看 {total.toLocaleString()} 套房源
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0">
            <div className="sm:hidden mb-4 px-2">
              <p className="text-sm text-gray-500">
                共找到{" "}
                <span className="font-semibold text-gray-900">
                  {total.toLocaleString()}
                </span>{" "}
                套房源
              </p>
            </div>

            {viewMode === "list" ? (
              <Suspense fallback={<div className="animate-pulse">加载中...</div>}>
                <PropertyList
                  properties={properties}
                  total={total}
                  page={page}
                  totalPages={totalPages}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  viewMode={listLayoutMode}
                  onSortChange={handleSortChange}
                  onViewModeChange={handleListLayoutChange}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<div className="animate-pulse h-[600px]">加载中...</div>}>
                <PropertyMap
                  properties={properties}
                  isLoading={isLoading}
                />
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
