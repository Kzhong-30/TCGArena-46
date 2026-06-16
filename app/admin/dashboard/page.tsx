import { requireRole } from "@/lib/session";
import db from "@/lib/prisma";
import {
  Users,
  Home,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);

  const stats = await db.$transaction([
    db.user.count(),
    db.user.count({ where: { role: "TENANT" } }),
    db.user.count({ where: { role: "LANDLORD" } }),
    db.property.count(),
    db.property.count({ where: { status: "PENDING" } }),
    db.property.count({ where: { status: "APPROVED" } }),
    db.booking.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.complaint.count(),
    db.complaint.count({ where: { status: "OPEN" } }),
    db.property.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { landlord: { select: { name: true, email: true } } },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    }),
    db.complaint.findMany({
      where: { status: "OPEN" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { complainant: { select: { name: true } } },
    }),
  ]);

  const [
    totalUsers,
    totalTenants,
    totalLandlords,
    totalProperties,
    pendingProperties,
    approvedProperties,
    totalBookings,
    pendingBookings,
    totalComplaints,
    openComplaints,
    recentPendingProperties,
    recentUsers,
    recentOpenComplaints,
  ] = stats;

  const cards = [
    { title: "用户总数", value: totalUsers, icon: Users, color: "bg-blue-500", href: "/admin/users" },
    { title: "房源总数", value: totalProperties, icon: Home, color: "bg-green-500", href: "/admin/properties" },
    { title: "预约总数", value: totalBookings, icon: Calendar, color: "bg-amber-500", href: "/admin/bookings" },
    { title: "投诉总数", value: totalComplaints, icon: AlertTriangle, color: "bg-red-500", href: "/admin/complaints" },
  ];

  const quickStats = [
    { label: "待审核房源", value: pendingProperties, color: "bg-amber-500", icon: Clock, href: "/admin/properties?status=PENDING" },
    { label: "已发布房源", value: approvedProperties, color: "bg-green-500", icon: CheckCircle, href: "/admin/properties?status=APPROVED" },
    { label: "待处理预约", value: pendingBookings, color: "bg-blue-500", icon: Clock, href: "/admin/bookings?status=PENDING" },
    { label: "待处理投诉", value: openComplaints, color: "bg-red-500", icon: AlertTriangle, href: "/admin/complaints?status=OPEN" },
  ];

  const roleColors: Record<string, string> = {
    TENANT: "bg-blue-100 text-blue-700",
    LANDLORD: "bg-green-100 text-green-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };

  const roleLabels: Record<string, string> = {
    TENANT: "租客",
    LANDLORD: "房东",
    ADMIN: "管理员",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500 mt-1">数据概览和平台运营情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">待审核房源</h2>
            <Link href="/admin/properties?status=PENDING" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          {recentPendingProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无待审核房源</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPendingProperties.map((property) => (
                <div key={property.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.landlord.name}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(property.createdAt)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">待审核</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最新注册用户</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无用户</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">
                      {user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(user.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">待处理投诉</h2>
          <Link href="/admin/complaints?status=OPEN" className="text-sm text-blue-600 hover:underline">
            查看全部
          </Link>
        </div>
        {recentOpenComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无待处理投诉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOpenComplaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{complaint.title}</p>
                  <p className="text-sm text-gray-500">投诉人: {complaint.complainant.name}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(complaint.createdAt)}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">待处理</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
