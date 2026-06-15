"use client";

import { useState } from "react";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Building2,
  Castle,
  Hotel,
  Warehouse,
  OfficeBuilding,
  ShoppingBag,
  BedDouble,
  Bath,
  Maximize2,
  Compass,
  Sofa,
  Car,
  Elevator,
  Trees,
  Waves,
  Dumbbell,
  Dog,
  Cigarette,
  RotateCcw,
} from "lucide-react";
import {
  PROPERTY_TYPES,
  ORIENTATIONS,
  PRICE_RANGES,
  AREA_RANGES,
  BEDROOM_OPTIONS,
  FACILITIES,
  DISTRICTS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertyFilters } from "@/types";

interface PropertyFilterProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onApply: () => void;
  onReset: () => void;
  selectedCity: string;
  totalCount: number;
}

const PROPERTY_TYPE_ICONS: Record<string, any> = {
  APARTMENT: Building2,
  HOUSE: Home,
  VILLA: Castle,
  STUDIO: Hotel,
  LOFT: Warehouse,
  DORMITORY: Hotel,
  OFFICE: OfficeBuilding,
  COMMERCIAL: ShoppingBag,
};

export default function PropertyFilter({
  filters,
  onFilterChange,
  onApply,
  onReset,
  selectedCity,
  totalCount,
}: PropertyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    propertyType: true,
    price: true,
    area: true,
    bedrooms: true,
    orientation: false,
    facilities: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
      page: 1,
    });
  };

  const handlePriceRangeSelect = (min: number, max: number | null) => {
    handleFilterChange("minPrice", min);
    handleFilterChange("maxPrice", max);
  };

  const handleAreaRangeSelect = (min: number, max: number | null) => {
    handleFilterChange("minArea", min);
    handleFilterChange("maxArea", max);
  };

  const handleFacilityToggle = (key: string) => {
    handleFilterChange(key, !filters[key as keyof PropertyFilters]);
  };

  const isPriceRangeSelected = (min: number, max: number | null) => {
    return filters.minPrice === min && filters.maxPrice === max;
  };

  const isAreaRangeSelected = (min: number, max: number | null) => {
    return filters.minArea === min && filters.maxArea === max;
  };

  const hasActiveFilters = () => {
    return (
      filters.propertyType ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minArea !== undefined ||
      filters.maxArea !== undefined ||
      filters.bedrooms !== undefined ||
      filters.bathrooms !== undefined ||
      filters.orientation ||
      filters.furnished ||
      filters.hasParking ||
      filters.hasElevator ||
      filters.hasBalcony ||
      filters.hasGarden ||
      filters.hasPool ||
      filters.hasGym ||
      filters.petsAllowed ||
      filters.smokingAllowed ||
      filters.district
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minArea !== undefined || filters.maxArea !== undefined) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.bathrooms !== undefined) count++;
    if (filters.orientation) count++;
    if (filters.district) count++;
    if (filters.furnished) count++;
    if (filters.hasParking) count++;
    if (filters.hasElevator) count++;
    if (filters.hasBalcony) count++;
    if (filters.hasGarden) count++;
    if (filters.hasPool) count++;
    if (filters.hasGym) count++;
    if (filters.petsAllowed) count++;
    if (filters.smokingAllowed) count++;
    return count;
  };

  const availableDistricts = selectedCity ? DISTRICTS[selectedCity] || [] : [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              isOpen
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4" />
            筛选
            {activeFiltersCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount()}
              </span>
            )}
          </button>

          {hasActiveFilters() && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              重置筛选
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          共找到 <span className="font-semibold text-gray-900">{totalCount}</span> 套房源
        </div>
      </div>

      {isOpen && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          {availableDistricts.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">区域</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("district", undefined)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    !filters.district
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  全部
                </button>
                {availableDistricts.map((district) => (
                  <button
                    key={district}
                    onClick={() => handleFilterChange("district", district)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      filters.district === district
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <button
                onClick={() => toggleSection("propertyType")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  房屋类型
                </h3>
                {expandedSections.propertyType ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.propertyType && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROPERTY_TYPES.map((type) => {
                    const IconComponent = PROPERTY_TYPE_ICONS[type.value] || Building2;
                    return (
                      <button
                        key={type.value}
                        onClick={() =>
                          handleFilterChange(
                            "propertyType",
                            filters.propertyType === type.value ? undefined : type.value
                          )
                        }
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          filters.propertyType === type.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">¥</span>
                  租金区间
                </h3>
                {expandedSections.price ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.price && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePriceRangeSelect(undefined as any, undefined as any)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      filters.minPrice === undefined && filters.maxPrice === undefined
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    不限
                  </button>
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRangeSelect(range.min, range.max!)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isPriceRangeSelected(range.min, range.max)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection("area")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  面积范围
                </h3>
                {expandedSections.area ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.area && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAreaRangeSelect(undefined as any, undefined as any)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      filters.minArea === undefined && filters.maxArea === undefined
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    不限
                  </button>
                  {AREA_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleAreaRangeSelect(range.min, range.max!)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isAreaRangeSelected(range.min, range.max)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection("bedrooms")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  户型
                </h3>
                {expandedSections.bedrooms ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.bedrooms && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">卧室</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleFilterChange("bedrooms", undefined)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                          filters.bedrooms === undefined
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        不限
                      </button>
                      {BEDROOM_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange("bedrooms", option.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            filters.bedrooms === option.value
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">卫生间</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleFilterChange("bathrooms", undefined)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                          filters.bathrooms === undefined
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        不限
                      </button>
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleFilterChange("bathrooms", num)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            filters.bathrooms === num
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {num}卫
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection("orientation")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  朝向
                </h3>
                {expandedSections.orientation ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.orientation && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange("orientation", undefined)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      !filters.orientation
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    不限
                  </button>
                  {ORIENTATIONS.map((orientation) => (
                    <button
                      key={orientation.value}
                      onClick={() => handleFilterChange("orientation", orientation.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        filters.orientation === orientation.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {orientation.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection("facilities")}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sofa className="h-4 w-4" />
                  配套设施
                </h3>
                {expandedSections.facilities ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSections.facilities && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACILITIES.map((facility) => {
                    const IconComponent = facility.icon;
                    const isActive = filters[facility.key as keyof PropertyFilters] as boolean;
                    return (
                      <button
                        key={facility.key}
                        onClick={() => handleFacilityToggle(facility.key)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                        {facility.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={onReset}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              重置
            </button>
            <button
              onClick={() => {
                onApply();
                setIsOpen(false);
              }}
              className="px-8 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              应用筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
