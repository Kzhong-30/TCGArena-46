"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type {
  SmartFillRequest,
  SmartFillResponse,
  SmartFillField,
  PropertyType,
  RentPeriod,
} from "@/types";
import { cn } from "@/lib/utils";

type FieldValueType = string | number | boolean | undefined;

interface SmartFillButtonProps {
  currentStep: number;
  formData: Partial<{
    title: string;
    description: string;
    type: PropertyType;
    area: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    orientation: string;
    furnished: boolean;
    hasParking: boolean;
    hasElevator: boolean;
    hasBalcony: boolean;
    hasGarden: boolean;
    hasPool: boolean;
    hasGym: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    address: string;
    city: string;
    district: string;
    province: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    price: number;
    rentPeriod: RentPeriod;
    deposit: number;
    availableFrom: string;
    minimumStay: number;
    maximumStay: number;
  }>;
  onApply: (field: string, value: FieldValueType | null | undefined) => void;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  title: "房源标题",
  description: "房源描述",
  type: "房源类型",
  area: "面积",
  bedrooms: "卧室数量",
  bathrooms: "卫生间数量",
  floor: "楼层",
  totalFloors: "总楼层",
  orientation: "朝向",
  furnished: "精装修",
  hasParking: "停车位",
  hasElevator: "电梯",
  hasBalcony: "阳台",
  hasGarden: "花园",
  hasPool: "游泳池",
  hasGym: "健身房",
  petsAllowed: "允许养宠物",
  smokingAllowed: "允许吸烟",
  address: "详细地址",
  city: "城市",
  district: "区域",
  province: "省份",
  zipCode: "邮政编码",
  latitude: "纬度",
  longitude: "经度",
  price: "月租金",
  rentPeriod: "付款周期",
  deposit: "押金",
  availableFrom: "可入住日期",
  minimumStay: "最短租期",
  maximumStay: "最长租期",
};

const STEP_FIELDS: Record<number, string[]> = {
  1: ["title", "description", "type", "area", "bedrooms", "bathrooms", "floor", "totalFloors", "orientation"],
  2: ["address", "city", "district", "province", "zipCode", "latitude", "longitude"],
  3: ["furnished", "hasParking", "hasElevator", "hasBalcony", "hasGarden", "hasPool", "hasGym", "petsAllowed", "smokingAllowed"],
  4: [],
  5: ["price", "rentPeriod", "deposit", "availableFrom", "minimumStay", "maximumStay"],
};

function formatValue(value: FieldValueType | null): string {
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }
  if (value === null || value === undefined) {
    return "-";
  }
  return String(value);
}

function formatSuggestionValue(
  field: string,
  value: FieldValueType | null
): string {
  if (value === null || value === undefined) return "-";
  if (field === "type") {
    const typeLabels: Record<string, string> = {
      APARTMENT: "公寓",
      HOUSE: "住宅",
      VILLA: "别墅",
      STUDIO: "单间",
      LOFT: "LOFT",
      DORMITORY: "宿舍",
      OFFICE: "写字楼",
      COMMERCIAL: "商铺",
    };
    return typeLabels[String(value)] || String(value);
  }
  if (field === "rentPeriod") {
    const periodLabels: Record<string, string> = {
      MONTHLY: "按月",
      QUARTERLY: "按季",
      YEARLY: "按年",
      DAILY: "按天",
    };
    return periodLabels[String(value)] || String(value);
  }
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }
  return String(value);
}

function getConfidenceColor(confidence: number | undefined): string {
  const c = confidence ?? 0.7;
  if (c >= 0.8) return "text-green-600";
  if (c >= 0.6) return "text-amber-600";
  return "text-gray-600";
}

function getConfidenceLabel(confidence: number | undefined): string {
  const c = confidence ?? 0.7;
  if (c >= 0.8) return "高";
  if (c >= 0.6) return "中";
  return "低";
}

export default function SmartFillButton({
  currentStep,
  formData,
  onApply,
  className,
}: SmartFillButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartFillResponse["data"] | null>(null);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  const handleSmartFill = async () => {
    setIsLoading(true);
    try {
      const requestData: SmartFillRequest = { ...formData };
      const response = await axios.post<SmartFillResponse>(
        "/api/properties/smart-fill",
        requestData
      );

      if (response.data.success && Object.keys(response.data.data).length > 0) {
        setSuggestions(response.data.data);
        const stepFields = STEP_FIELDS[currentStep] || [];
        const availableFields = Object.keys(response.data.data).filter(
          (key) => stepFields.length === 0 || stepFields.includes(key)
        );
        setSelectedFields(new Set(availableFields));
        setShowConfirm(true);
        toast.success(response.data.message || "智能填充完成", {
          description: `处理耗时 ${response.data.processingTime}ms`,
        });
      } else {
        toast.info("暂无可智能填充的内容", {
          description: "请填写更多信息后再试",
        });
      }
    } catch (error) {
      console.error("Smart fill error:", error);
      toast.error("智能填充失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (suggestions) {
      const stepFields = STEP_FIELDS[currentStep] || [];
      const availableFields = Object.keys(suggestions).filter(
        (key) => stepFields.length === 0 || stepFields.includes(key)
      );
      setSelectedFields(new Set(availableFields));
    }
  };

  const deselectAll = () => {
    setSelectedFields(new Set());
  };

  const applySuggestions = () => {
    if (!suggestions) return;

    const stepFields = STEP_FIELDS[currentStep] || [];
    let appliedCount = 0;

    for (const field of selectedFields) {
      const suggestion = suggestions[field as keyof typeof suggestions];
      if (suggestion && (stepFields.length === 0 || stepFields.includes(field))) {
        const fieldSuggestion = suggestion as unknown as SmartFillField<FieldValueType>;
        onApply(field, fieldSuggestion.suggestedValue ?? null);
        appliedCount++;
      }
    }

    setShowConfirm(false);
    setSuggestions(null);
    setSelectedFields(new Set());

    toast.success("已应用智能填充", {
      description: `成功应用 ${appliedCount} 项建议`,
    });
  };

  const cancel = () => {
    setShowConfirm(false);
    setSuggestions(null);
    setSelectedFields(new Set());
  };

  if (showConfirm && suggestions) {
    const stepFields = STEP_FIELDS[currentStep] || [];
    const displayFields = Object.entries(suggestions).filter(
      ([key]) =>
        key !== "suggestedRentRange" &&
        (stepFields.length === 0 || stepFields.includes(key))
    );

    const rentRange = suggestions.suggestedRentRange;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    智能填充建议
                  </h3>
                  <p className="text-sm text-gray-500">
                    请确认以下自动填充的信息
                  </p>
                </div>
              </div>
              <button
                onClick={cancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {rentRange && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    推荐租金区间
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    ${rentRange.min} - ${rentRange.max} ${rentRange.unit}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  均价: ${rentRange.avg} ${rentRange.unit}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                共 {displayFields.length} 项建议
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全选
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  取消全选
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {displayFields.map(([field, suggestion]) => {
                const fieldSuggestion = suggestion as unknown as SmartFillField<FieldValueType>;
                const isSelected = selectedFields.has(field);
                const label = FIELD_LABELS[field] || field;

                return (
                  <label
                    key={field}
                    className={cn(
                      "block p-4 border rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleField(field)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {label}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              getConfidenceColor(fieldSuggestion.confidence)
                            )}
                          >
                            置信度: {getConfidenceLabel(
                              fieldSuggestion.confidence
                            )}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-sm text-gray-400 line-through">
                            {formatValue(fieldSuggestion.originalValue)}
                          </span>
                          <span className="text-gray-300">→</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatSuggestionValue(
                              field,
                              fieldSuggestion.suggestedValue ?? null
                            )}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {fieldSuggestion.reason}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={cancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={applySuggestions}
              disabled={selectedFields.size === 0}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2",
                selectedFields.size > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <Check className="w-5 h-5" />
              <span>应用选中项 ({selectedFields.size})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSmartFill}
      disabled={isLoading}
      className={cn(
        "flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>AI 智能分析中...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>智能填写</span>
        </>
      )}
    </button>
  );
}
