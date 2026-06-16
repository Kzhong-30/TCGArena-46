"use client";

import {
  Sofa,
  Car,
  ArrowUpCircle,
  Sun,
  Trees,
  Waves,
  Dumbbell,
  PawPrint,
  Cigarette,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

interface FacilityIconsProps {
  property: Property;
  className?: string;
  showUnavailable?: boolean;
}

interface FacilityConfig {
  key: keyof Property;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const FACILITY_CONFIG: FacilityConfig[] = [
  {
    key: "furnished",
    label: "家具齐全",
    icon: Sofa,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    key: "hasParking",
    label: "停车位",
    icon: Car,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "hasElevator",
    label: "电梯",
    icon: ArrowUpCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "hasBalcony",
    label: "阳台",
    icon: Sun,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "hasGarden",
    label: "花园",
    icon: Trees,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "hasPool",
    label: "游泳池",
    icon: Waves,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    key: "hasGym",
    label: "健身房",
    icon: Dumbbell,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    key: "petsAllowed",
    label: "允许宠物",
    icon: PawPrint,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    key: "smokingAllowed",
    label: "允许吸烟",
    icon: Cigarette,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

export default function FacilityIcons({
  property,
  className,
  showUnavailable = false,
}: FacilityIconsProps) {
  const availableFacilities = FACILITY_CONFIG.filter(
    (config) => property[config.key] === true
  );

  const unavailableFacilities = FACILITY_CONFIG.filter(
    (config) => property[config.key] === false
  );

  if (availableFacilities.length === 0 && !showUnavailable) {
    return (
      <div className={cn("text-gray-500 text-sm", className)}>
        暂无配套设施信息
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">配套设施</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {availableFacilities.map((config) => {
          const Icon = config.icon;
          return (
            <div
              key={config.key}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105",
                config.bgColor
              )}
            >
              <div className={cn("p-3 rounded-full bg-white shadow-sm mb-2")}>
                <Icon className={cn("w-6 h-6", config.color)} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {config.label}
              </span>
              <Check className="w-4 h-4 text-green-500 mt-1" />
            </div>
          );
        })}

        {showUnavailable &&
          unavailableFacilities.map((config) => {
            const Icon = config.icon;
            return (
              <div
                key={config.key}
                className="flex flex-col items-center p-4 rounded-xl bg-gray-50 opacity-50"
              >
                <div className="p-3 rounded-full bg-white shadow-sm mb-2">
                  <Icon className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {config.label}
                </span>
                <X className="w-4 h-4 text-gray-400 mt-1" />
              </div>
            );
          })}
      </div>
    </div>
  );
}
