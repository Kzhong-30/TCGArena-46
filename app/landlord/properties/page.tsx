"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Home,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  BedDouble,
  Bath,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatCurrency, formatArea, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Property, ListingStatus } from "@/types";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LandlordPropertiesPage() {
  const { data: session } = useSession() ?? {};
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [listingFilter, setListingFilter] = useState<string>("ALL");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProperties();
    }
  }, [session?.user?.id, statusFilter, listingFilter]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (listingFilter !== "ALL") params.append("listingStatus", listingFilter);
      
      const res = await axios.get(`/api/landlord/properties?${params.toString()}`);
      setProperties(res.data.data || []);
    } catch (error) {
      toast.error("获取房源列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListing = async (id: string, currentStatus: ListingStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await axios.patch(`/api/landlord/properties/${id}/listing`, {
        listingStatus: newStatus,
      });
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, listingStatus: newStatus } : p
        )
      );
      toast.success(
        newStatus === "ACTIVE" ? "房源已上架" : "房源已下架"
      );
      setActionMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await axios.delete(`/api/landlord/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("房源已删除");
      setDeleteConfirm(null);
      setActionMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "删除失败");
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    RENTED: "bg-blue-100 text-blue-700",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "待审核",
    APPROVED: "已通过",
    REJECTED: "已拒绝",
    RENTED: "已出租",
  };

  const listingColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    SOLD: "bg-blue-100 text-blue-700",
  };

  const listingLabels: Record<string, string> = {
    ACTIVE: "上架中",
    INACTIVE: "已下架",
    SOLD: "已售出",
  };

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
          <h1 className="text-2xl font-bold text-gray-900">房源管理</h1>
          <p className="text-gray-500 mt-1">管理您发布的所有房源</p>
        </div>
        <Link
          href="/landlord/properties/create"
          className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          发布新房源
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索房源标题或地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">全部状态</option>
              <option value="PENDING">待审核</option>
              <option value="APPROVED">已通过</option>
              <option value="REJECTED">已拒绝</option>
              <option value="RENTED">已出租</option>
            </select>
            <select
              value={listingFilter}
              onChange={(e) => setListingFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">全部上下架</option>
              <option value="ACTIVE">上架中</option>
              <option value="INACTIVE">已下架</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <EmptyState
          icon="Home"
          title="暂无房源"
          description={searchQuery || statusFilter !== "ALL" || listingFilter !== "ALL" 
            ? "没有找到符合条件的房源" 
            : "您还没有发布任何房源，点击上方按钮发布您的第一个房源"}
          action={
            !searchQuery && statusFilter === "ALL" && listingFilter === "ALL" ? {
              label: "发布房源",
              href: "/landlord/properties/create",
            } : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                  {property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Home className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        statusColors[property.status]
                      )}
                    >
                      {statusLabels[property.status]}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        listingColors[property.listingStatus]
                      )}
                    >
                      {listingLabels[property.listingStatus]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {property.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 truncate">
                        {property.address}, {property.district}, {property.city}
                      </p>
                    </div>
                    <div className="relative ml-4">
                      <button
                        onClick={() =>
                          setActionMenu(actionMenu === property.id ? null : property.id)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenu === property.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <Link
                              href={`/properties/${property.id}`}
                              target="_blank"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenu(null)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </Link>
                            <Link
                              href={`/landlord/properties/${property.id}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenu(null)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑房源
                            </Link>
                            <button
                              onClick={() =>
                                toggleListing(property.id, property.listingStatus)
                              }
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {property.listingStatus === "ACTIVE" ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  下架房源
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  上架房源
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm(property.id);
                                setActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除房源
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-600 text-sm mt-3">
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

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.price)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">/月</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      创建于 {formatRelativeTime(property.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/landlord/properties/${property.id}/edit`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Link>
                    <button
                      onClick={() => toggleListing(property.id, property.listingStatus)}
                      disabled={property.status === "PENDING" || property.status === "REJECTED"}
                      className={cn(
                        "flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                        property.status === "PENDING" || property.status === "REJECTED"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : property.listingStatus === "ACTIVE"
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      )}
                    >
                      {property.listingStatus === "ACTIVE" ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          下架
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          上架
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              确认删除
            </h3>
            <p className="text-gray-500 text-center mb-6">
              删除后房源信息将无法恢复，您确定要删除这个房源吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => deleteProperty(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
