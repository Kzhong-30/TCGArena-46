"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { cn, formatCurrency, formatArea } from "@/lib/utils";
import type { Property } from "@/types";
import { STATUS_COLORS } from "@/lib/constants";

interface PropertyCardProps {
  property: Property & {
    landlord?: { name: string | null; image: string | null };
    _count?: { favorites: number; reviews: number };
  };
  showActions?: boolean;
  viewMode?: "grid" | "list";
}

export default function PropertyCard({ property, showActions = true, viewMode = "grid" }: PropertyCardProps) {
  const { data: session } = useSession() ?? {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images: string[] = property.images;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("请先登录");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${property.id}`);
        setIsFavorite(false);
        toast.success("已取消收藏");
      } else {
        await axios.post("/api/favorites", { propertyId: property.id });
        setIsFavorite(true);
        toast.success("已添加到收藏");
      }
    } catch (error) {
      toast.error("操作失败，请稍后重试");
    }
  };

  const averageRating = property._count?.reviews ? 4.5 : 0;

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        "group block bg-white rounded-xl overflow-hidden border border-gray-200 property-card",
        viewMode === "list" && "flex flex-col sm:flex-row"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "relative overflow-hidden bg-gray-100",
        viewMode === "list" ? "sm:w-72 sm:h-52 w-full aspect-[4/3]" : "aspect-[4/3]"
      )}>
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {images.length > 1 && isHovered && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-opacity"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="w-12 h-12" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {property.isFeatured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
              精选
            </span>
          )}
          <span className={cn("px-2 py-1 text-xs font-medium rounded-full", STATUS_COLORS[property.status])}>
            {property.status === "APPROVED" ? "已审核" : property.status === "PENDING" ? "待审核" : "已下架"}
          </span>
        </div>

        {showActions && (
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
          >
            <Heart
              className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")}
            />
          </button>
        )}

        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 rounded-lg font-bold text-lg">
            {formatCurrency(property.price)}
            <span className="text-xs font-normal text-gray-500 ml-1">
              /{property.rentPeriod === "MONTHLY" ? "月" : property.rentPeriod === "QUARTERLY" ? "季" : "年"}
            </span>
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.address}</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
          <div className="flex items-center">
            <BedDouble className="w-4 h-4 mr-1" />
            <span>{property.bedrooms}室</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathrooms}卫</span>
          </div>
          <div className="flex items-center">
            <Maximize2 className="w-4 h-4 mr-1" />
            <span>{formatArea(property.area)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            {averageRating > 0 && (
              <div className="flex items-center text-amber-500 mr-3">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-sm font-medium">{averageRating}</span>
                <span className="text-gray-400 text-sm ml-1">({property._count?.reviews || 0})</span>
              </div>
            )}
          </div>
          {property.landlord && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">房东</span>
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs">
                {property.landlord.name?.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
