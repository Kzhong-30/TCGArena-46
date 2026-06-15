"use client";

import Image from "next/image";
import {
  MessageCircle,
  Phone,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface LandlordCardProps {
  landlord: User & {
    _count?: {
      properties: number;
      reviews: number;
    };
  };
  propertyCount?: number;
  reviewCount?: number;
  averageRating?: number;
  responseRate?: number;
  responseTime?: string;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
}

export default function LandlordCard({
  landlord,
  propertyCount,
  reviewCount,
  averageRating = 0,
  responseRate = 95,
  responseTime = "1小时内",
  onMessage,
  onCall,
  className,
}: LandlordCardProps) {
  const displayPropertyCount =
    propertyCount ?? landlord._count?.properties ?? 0;
  const displayReviewCount = reviewCount ?? landlord._count?.reviews ?? 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-200 p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {landlord.image ? (
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-50">
                <Image
                  src={landlord.image}
                  alt={landlord.name || "房东头像"}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold",
                  getAvatarColor(landlord.name || "")
                )}
              >
                {getInitials(landlord.name || "")}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {landlord.name}
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                认证房东
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {landlord.phone && (
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {landlord.phone}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center mt-2">
        {averageRating > 0 && (
          <>
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-sm text-gray-500">
              {displayReviewCount} 条评价
            </span>
          </>
        )}
      </div>

      {landlord.bio && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 leading-relaxed">
            {landlord.bio}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-900">
            {displayPropertyCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">在租房源</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
          <p className="text-xs text-gray-500 mt-1">回复率</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-900">{responseTime}</p>
          <p className="text-xs text-gray-500 mt-1">平均响应</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm text-gray-500">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span>本地房东</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>加入时间 {new Date(landlord.createdAt).getFullYear()} 年</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onMessage}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          在线咨询
        </button>
        <button
          onClick={onCall}
          className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
        >
          <Phone className="w-5 h-5 mr-2" />
          电话联系
        </button>
      </div>
    </div>
  );
}
