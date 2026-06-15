"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  Sparkles,
  MapPin,
  MessageCircle,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatRelativeTime, getAvatarColor, getInitials } from "@/lib/utils";
import type { ReviewWithDetails } from "@/types";

interface ReviewListProps {
  reviews: ReviewWithDetails[];
  averageRating?: number;
  totalCount?: number;
  className?: string;
}

interface RatingBreakdown {
  cleanliness: number;
  location: number;
  communication: number;
  value: number;
}

export default function ReviewList({
  reviews,
  averageRating,
  totalCount,
  className,
}: ReviewListProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const displayReviews = showAll ? reviews : reviews.slice(0, 3);

  const calculateAverageRatings = (): RatingBreakdown => {
    if (reviews.length === 0) {
      return { cleanliness: 0, location: 0, communication: 0, value: 0 };
    }

    const totals = reviews.reduce(
      (acc, review) => ({
        cleanliness: acc.cleanliness + (review.cleanliness || 0),
        location: acc.location + (review.location || 0),
        communication: acc.communication + (review.communication || 0),
        value: acc.value + (review.value || 0),
      }),
      { cleanliness: 0, location: 0, communication: 0, value: 0 }
    );

    return {
      cleanliness: totals.cleanliness / reviews.length,
      location: totals.location / reviews.length,
      communication: totals.communication / reviews.length,
      value: totals.value / reviews.length,
    };
  };

  const ratingBreakdown = calculateAverageRatings();
  const calculatedAverage =
    averageRating ??
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (label: string, value: number, icon: React.ReactNode) => (
    <div className="flex items-center space-x-3">
      <div className="w-20 flex items-center text-sm text-gray-600">
        {icon}
        <span className="ml-1">{label}</span>
      </div>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-medium text-gray-700">
        {value.toFixed(1)}
      </span>
    </div>
  );

  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
        <p className="text-gray-500">该房源还没有收到评价</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
          房源评价
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalCount || reviews.length} 条)
          </span>
        </h3>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {calculatedAverage.toFixed(1)}
              </div>
              <div className="mt-2">{renderStars(calculatedAverage, "md")}</div>
              <p className="text-sm text-gray-500 mt-1">
                {totalCount || reviews.length} 条评价
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {renderRatingBar("整洁度", ratingBreakdown.cleanliness, <Sparkles className="w-4 h-4" />)}
            {renderRatingBar("位置", ratingBreakdown.location, <MapPin className="w-4 h-4" />)}
            {renderRatingBar("沟通", ratingBreakdown.communication, <MessageCircle className="w-4 h-4" />)}
            {renderRatingBar("性价比", ratingBreakdown.value, <ThumbsUp className="w-4 h-4" />)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {displayReviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const shouldTruncate = (review.comment?.length || 0) > 200;

          return (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {review.tenant.image ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={review.tenant.image}
                        alt={review.tenant.name || "用户头像"}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium",
                        getAvatarColor(review.tenant.name || "")
                      )}
                    >
                      {getInitials(review.tenant.name || "")}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.tenant.name || "匿名用户"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatRelativeTime(review.createdAt)}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {(review.cleanliness ||
                review.location ||
                review.communication ||
                review.value) && (
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {review.cleanliness && (
                    <span className="text-gray-600">
                      整洁度: <span className="font-medium text-gray-900">{review.cleanliness}.0</span>
                    </span>
                  )}
                  {review.location && (
                    <span className="text-gray-600">
                      位置: <span className="font-medium text-gray-900">{review.location}.0</span>
                    </span>
                  )}
                  {review.communication && (
                    <span className="text-gray-600">
                      沟通: <span className="font-medium text-gray-900">{review.communication}.0</span>
                    </span>
                  )}
                  {review.value && (
                    <span className="text-gray-600">
                      性价比: <span className="font-medium text-gray-900">{review.value}.0</span>
                    </span>
                  )}
                </div>
              )}

              {review.comment && (
                <div className="relative">
                  <p
                    className={cn(
                      "text-gray-600 leading-relaxed",
                      !isExpanded && shouldTruncate && "line-clamp-3"
                    )}
                  >
                    {review.comment}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      {isExpanded ? (
                        <>
                          收起 <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          查看更多 <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            {showAll ? (
              <>
                收起评价 <ChevronUp className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                查看全部 {reviews.length} 条评价{" "}
                <ChevronDown className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
