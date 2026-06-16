"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  CalendarClock,
  Search,
  MoreVertical,
  Phone,
  Mail,
  User,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatDate, formatDateTime, formatRelativeTime, cn } from "@/lib/utils";
import type { Booking, Property, User as UserType } from "@/types";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BookingWithDetails extends Booking {
  property: Property;
  tenant: UserType;
}

export default function LandlordBookingsPage() {
  const { data: session } = useSession() ?? {};
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<BookingWithDetails | null>(null);
  const [rejectModal, setRejectModal] = useState<BookingWithDetails | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
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

      const res = await axios.get(`/api/landlord/bookings?${params.toString()}`);
      setBookings(res.data.data || []);
    } catch (error) {
      toast.error("获取预约列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      await axios.patch(`/api/landlord/bookings/${bookingId}/confirm`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
      );
      toast.success("预约已确认");
      setActionMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setIsProcessing(true);
      await axios.patch(`/api/landlord/bookings/${rejectModal.id}/reject`, {
        reason: rejectReason,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rejectModal.id
            ? { ...b, status: "REJECTED", rejectionReason: rejectReason }
            : b
        )
      );
      toast.success("预约已拒绝");
      setRejectModal(null);
      setRejectReason("");
      setActionMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal || !newDate || !newTime) return;
    try {
      setIsProcessing(true);
      await axios.patch(`/api/landlord/bookings/${rescheduleModal.id}/reschedule`, {
        preferredDate: newDate,
        preferredTime: newTime,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleModal.id
            ? {
                ...b,
                status: "RESCHEDULED",
                preferredDate: new Date(newDate),
                preferredTime: newTime,
              }
            : b
        )
      );
      toast.success("预约已改期");
      setRescheduleModal(null);
      setNewDate("");
      setNewTime("");
      setActionMenu(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">预约管理</h1>
          <p className="text-gray-500 mt-1">管理房客的看房预约</p>
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
              placeholder="搜索房源、房客姓名或邮箱..."
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
              : "您还没有收到任何看房预约"
          }
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
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-lg">
                          {booking.tenant.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {booking.tenant.name || "未知用户"}
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
                        <p className="text-gray-600 font-medium mt-1">
                          {booking.property.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
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
                          {booking.tenant.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1.5" />
                              {booking.tenant.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1.5" />
                            {booking.tenant.email}
                          </div>
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
                                拒绝原因：{booking.rejectionReason}
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
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenu(actionMenu === booking.id ? null : booking.id)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenu === booking.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            {booking.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleConfirm(booking.id)}
                                  disabled={isProcessing}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  确认预约
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModal(booking);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  拒绝预约
                                </button>
                                <button
                                  onClick={() => {
                                    setRescheduleModal(booking);
                                    setNewDate(
                                      booking.preferredDate
                                        .toString()
                                        .split("T")[0]
                                    );
                                    setNewTime(booking.preferredTime);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                                >
                                  <CalendarClock className="w-4 h-4 mr-2" />
                                  改期
                                </button>
                              </>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <>
                                <button
                                  onClick={() => {
                                    setRescheduleModal(booking);
                                    setNewDate(
                                      booking.preferredDate
                                        .toString()
                                        .split("T")[0]
                                    );
                                    setNewTime(booking.preferredTime);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
                                >
                                  <CalendarClock className="w-4 h-4 mr-2" />
                                  改期
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModal(booking);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  取消预约
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {booking.status === "PENDING" && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      确认预约
                    </button>
                    <button
                      onClick={() => {
                        setRejectModal(booking);
                      }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      拒绝预约
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleModal(booking);
                        setNewDate(booking.preferredDate.toString().split("T")[0]);
                        setNewTime(booking.preferredTime);
                      }}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <CalendarClock className="w-4 h-4 mr-2" />
                      改期
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              拒绝预约
            </h3>
            <p className="text-gray-500 text-center mb-4">
              请填写拒绝原因，房客将会收到通知
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="例如：该时间段已有预约..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "处理中..." : "确认拒绝"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4">
              <CalendarClock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              改期
            </h3>
            <p className="text-gray-500 text-center mb-4">
              请选择新的看房日期和时间
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新日期
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新时间
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRescheduleModal(null);
                  setNewDate("");
                  setNewTime("");
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleReschedule}
                disabled={isProcessing || !newDate || !newTime}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "处理中..." : "确认改期"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
