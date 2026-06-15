"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Heart,
  Calendar,
  Share2,
  ChevronRight,
  Home,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";
import FacilityIcons from "@/components/FacilityIcons";
import LandlordCard from "@/components/LandlordCard";
import BookingModal from "@/components/BookingModal";
import ReviewList from "@/components/ReviewList";
import {
  cn,
  formatCurrency,
  formatArea,
  formatDate,
} from "@/lib/utils";
import { PROPERTY_TYPES, ORIENTATIONS, RENT_PERIODS, MAP_CENTER } from "@/lib/constants";
import type {
  PropertyWithDetails,
  ReviewWithDetails,
  Property,
} from "@/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface PropertyClientProps {
  property: PropertyWithDetails;
  reviews: ReviewWithDetails[];
  landlordPropertyCount: number;
  averageRating: number;
  isFavorited: boolean;
  currentUserId?: string;
}

export default function PropertyClient({
  property,
  reviews,
  landlordPropertyCount,
  averageRating,
  isFavorited: initialIsFavorited,
  currentUserId,
}: PropertyClientProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  const images = Array.isArray(property.images) ? property.images : [];

  useEffect(() => {
    Promise.all([
      import("leaflet/dist/leaflet.css"),
      import("leaflet"),
    ]).then(([_, leafletModule]) => {
      setL(leafletModule);
      setMapLoaded(true);
    });
  }, []);

  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getOrientationLabel = (orientation?: string) => {
    if (!orientation) return "";
    return ORIENTATIONS.find((o) => o.value === orientation)?.label || orientation;
  };

  const getRentPeriodLabel = (period: string) => {
    return RENT_PERIODS.find((p) => p.value === period)?.label || period;
  };

  const toggleFavorite = async () => {
    if (!currentUserId) {
      toast.error("请先登录后再收藏");
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await axios.delete(`/api/favorites/${property.id}`);
        setIsFavorited(false);
        toast.success("已取消收藏");
      } else {
        await axios.post("/api/favorites", { propertyId: property.id });
        setIsFavorited(true);
        toast.success("已添加到收藏");
      }
    } catch (error) {
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("链接已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
  };

  const lat = property.latitude
    ? parseFloat(property.latitude.toString())
    : MAP_CENTER.lat;
  const lng = property.longitude
    ? parseFloat(property.longitude.toString())
    : MAP_CENTER.lng;

  const customIcon = mapLoaded && L
    ? L.divIcon({
        html: `<div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>`,
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href="/properties"
                className="hover:text-blue-600 transition-colors"
              >
                房源列表
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {property.title}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg border transition-all",
                  isFavorited
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Heart
                  className={cn("w-5 h-5 mr-2", isFavorited && "fill-current")}
                />
                {isFavorited ? "已收藏" : "收藏"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Share2 className="w-5 h-5 mr-2" />
                分享
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <ImageCarousel images={images} alt={property.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      {property.city} {property.district} {property.address}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(property.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{getRentPeriodLabel(property.rentPeriod)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <BedDouble className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {property.bedrooms} 室
                  </p>
                  <p className="text-xs text-gray-500">卧室</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {property.bathrooms} 卫
                  </p>
                  <p className="text-xs text-gray-500">卫生间</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Maximize2 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {formatArea(property.area)}
                  </p>
                  <p className="text-xs text-gray-500">建筑面积</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Navigation className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {getOrientationLabel(property.orientation) || "暂无"}
                  </p>
                  <p className="text-xs text-gray-500">朝向</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="text-sm">
                  <span className="text-gray-500">房源类型：</span>
                  <span className="text-gray-900 font-medium">
                    {getPropertyTypeLabel(property.type)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">装修情况：</span>
                  <span className="text-gray-900 font-medium">
                    {property.furnished ? "精装修" : "毛坯"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">楼层：</span>
                  <span className="text-gray-900 font-medium">
                    {property.floor
                      ? `${property.floor}/${property.totalFloors || "?"}层`
                      : "暂无信息"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">可入住时间：</span>
                  <span className="text-gray-900 font-medium">
                    {property.availableFrom
                      ? formatDate(property.availableFrom)
                      : "随时入住"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                房源描述
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <FacilityIcons property={property as Property} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <MapPin className="w-5 h-5 inline mr-2 text-blue-600" />
                周边位置
              </h3>
              {mapLoaded && (
                <div className="h-80 rounded-xl overflow-hidden">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {customIcon && (
                      <Marker position={[lat, lng]} icon={customIcon}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">
                              {property.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {property.address}
                            </p>
                            <p className="text-blue-600 font-semibold mt-1">
                              {formatCurrency(property.price)}
                              /{getRentPeriodLabel(property.rentPeriod)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  {property.city} {property.district} {property.address}
                </p>
                {property.latitude && property.longitude && (
                  <p className="mt-1">
                    坐标：{property.latitude.toString()},{" "}
                    {property.longitude.toString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <ReviewList
                reviews={reviews}
                averageRating={averageRating}
                totalCount={property._count?.reviews}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(property.price)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  /{getRentPeriodLabel(property.rentPeriod)}
                </div>
                {property.deposit && (
                  <p className="text-sm text-gray-500 mt-2">
                    押金：{formatCurrency(property.deposit)}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mb-3"
              >
                <Calendar className="w-5 h-5 mr-2" />
                一键预约看房
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5 mr-2" />
                在线咨询
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">服务保障</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    真实房源
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    房东认证
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    押金保障
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    极速响应
                  </div>
                </div>
              </div>
            </div>

            <LandlordCard
              landlord={property.landlord}
              propertyCount={landlordPropertyCount}
              reviewCount={property._count?.reviews || 0}
              averageRating={averageRating}
            />
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        property={property as Property}
        landlordId={property.landlordId}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
