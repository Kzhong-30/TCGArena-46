"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Search, X, AlertCircle, CalendarClock, MapPin, User, Phone, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import type { Booking, Property, User as UserType } from "@/types";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BookingWithDetails extends Booking {
  property: Property;
  landlord: UserType;
}

export default function TenantBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cancelModal, setCancelModal] = useState<BookingWithDetails | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session?.user?.id, statusFilter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await axios.get(`/api/bookings?${params.toString()}`);
      setBookings(res.data.data?.data || []);
    } catch (error) {
      toast.error("获取预约列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      setIsProcessing(true);
      await axios.patch(`/api/bookings/${cancelModal.id}/cancel`, {
        cancelReason: cancelReason || "用户取消",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelModal.id
            ? { ...b, status: "CANCELLED", rejectionReason: cancelReason || "用户取消" }
            : b
        )
      );
      toast.success("预约已取消");
      setCancelModal(null);
      setCancelReason("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    RESCHEDULED: "bg-purple-100 text-purple-700",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "待确认",
    CONFIRMED: "已确认",
    REJECTED: "已拒绝",
    CANCELLED: "已取消",
    COMPLETED: "已完成",
    RESCHEDULED: "已改期",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    { label: "全部预约", value: bookings.length, color: "bg-blue-500" },
    {
      label: "待确认",
      value: bookings.filter((b) => b.status === "PENDING").length,
      color: "bg-amber-500",
    },
    {
      label: "已确认",
      value: bookings.filter((b) => b.status === "CONFIRMED").length,
      color: "bg-green-500",
    },
    {
      label: "已完成",
      value: bookings.filter((b) => b.status === "COMPLETED").length,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的预约</h1>
          <p className="text-gray-500 mt-1">查看和管理您的看房预约</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">全部状态</option>
            <option value="PENDING">待确认</option>
            <option value="CONFIRMED">已确认</option>
            <option value="REJECTED">已拒绝</option>
            <option value="CANCELLED">已取消</option>
            <option value="COMPLETED">已完成</option>
            <option value="RESCHEDULED">已改期</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="暂无预约"
          description={
            searchQuery || statusFilter !== "ALL"
              ? "没有找到符合条件的预约记录"
              : "您还没有任何看房预约"
          }
          action={{
            label: "去浏览房源",
            href: "/properties",
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {booking.property.images && Array.isArray(booking.property.images) && booking.property.images.length > 0 ? (
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {booking.property.title}
                          </h3>
                          <span
                            className={cn(
                              "px-2.5 py-1 text-xs font-medium rounded-full",
                              statusColors[booking.status]
                            )}
                          >
                            {statusLabels[booking.status]}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.property.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarClock className="w-4 h-4 mr-1.5" />
                            {formatDate(booking.preferredDate)} {booking.preferredTime}
                          </div>
                          {booking.numberOfPeople && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1.5" />
                              {booking.numberOfPeople} 人
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-500">房东：</span>
                            {booking.landlord?.name || "未知"}
                          </p>
                          {booking.landlord?.phone && (
                            <p className="text-sm text-gray-600 mt-1">
                              <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                              {booking.landlord.phone}
                            </p>
                          )}
                        </div>
                        {booking.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{booking.message}</p>
                            </div>
                          </div>
                        )}
                        {booking.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-600">
                                {booking.status === "REJECTED" ? "拒绝原因" : "取消原因"}：
                                {booking.rejectionReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 md:flex-col md:items-end">
                    <span className="text-sm text-gray-400">
                      {formatRelativeTime(booking.createdAt)}
                    </span>
                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <button
                        onClick={() => setCancelModal(booking)}
                        className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        取消预约
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              取消预约
            </h3>
            <p className="text-gray-500 text-center mb-4">
              确定要取消这个看房预约吗？
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="取消原因（选填）"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                再想想
              </button>
              <button
                onClick={handleCancel}
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
