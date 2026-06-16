"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, MapPin, Home, Search, X, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import { formatCurrency, formatArea, formatRelativeTime } from "@/lib/utils";
import type { Favorite, Property, User as UserType } from "@/types";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FavoriteWithDetails extends Favorite {
  property: Property & {
    landlord: UserType;
    _count?: {
      bookings: number;
      reviews: number;
      favorites: number;
    };
  };
}

export default function TenantFavoritesPage() {
  const { data: session } = useSession() ?? {};
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<FavoriteWithDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites();
    }
  }, [session?.user?.id]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/favorites");
      setFavorites(res.data.data || []);
    } catch (error) {
      toast.error("获取收藏列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!deleteModal) return;
    try {
      setIsProcessing(true);
      await axios.delete(`/api/favorites/${deleteModal.id}`);
      setFavorites((prev) => prev.filter((f) => f.id !== deleteModal.id));
      toast.success("已取消收藏");
      setDeleteModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredFavorites = favorites.filter(
    (f) =>
      f.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
          <p className="text-gray-500 mt-1">管理您收藏的房源</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索房源标题、地址或城市..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <EmptyState
          icon="Home"
          title="暂无收藏"
          description={
            searchQuery
              ? "没有找到符合条件的收藏房源"
              : "您还没有收藏任何房源"
          }
          action={{
            label: "去浏览房源",
            href: "/properties",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative">
                {favorite.property.images.length > 0 ? (
                  <img
                    src={favorite.property.images[0]}
                    alt={favorite.property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => setDeleteModal(favorite)}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {favorite.property.title}
                  </h3>
                </div>

                <p className="text-lg font-bold text-blue-600 mb-2">
                  {formatCurrency(favorite.property.price)}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    /{favorite.property.rentPeriod === "MONTHLY" ? "月" : favorite.property.rentPeriod}
                  </span>
                </p>

                <p className="text-sm text-gray-500 flex items-center mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{favorite.property.address}</span>
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{favorite.property.bedrooms} 室</span>
                  <span>{favorite.property.bathrooms} 卫</span>
                  <span>{formatArea(favorite.property.area)}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    收藏于 {formatRelativeTime(favorite.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${favorite.property.id}`}
                      className="flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Link>
                    <button
                      onClick={() => setDeleteModal(favorite)}
                      className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              取消收藏
            </h3>
            <p className="text-gray-500 text-center mb-4">
              确定要取消收藏「{deleteModal.property.title}」吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                再想想
              </button>
              <button
                onClick={handleRemoveFavorite}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "处理中..." : "确认取消"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
