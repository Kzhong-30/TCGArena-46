import { requireRole } from "@/lib/session";
import db from "@/lib/prisma";
import {
  Home,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LandlordDashboardPage() {
  const user = await requireRole(["LANDLORD", "ADMIN"]);

  const stats = await db.$transaction([
    db.property.count({
      where: { landlordId: user.id },
    }),
    db.booking.count({
      where: { landlordId: user.id },
    }),
    db.booking.count({
      where: { landlordId: user.id, status: "PENDING" },
    }),
    db.booking.count({
      where: { landlordId: user.id, status: "CONFIRMED" },
    }),
    db.property.aggregate({
      where: { landlordId: user.id, listingStatus: "ACTIVE" },
      _sum: { price: true },
      _count: true,
    }),
    db.booking.findMany({
      where: { landlordId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { title: true, images: true } },
        tenant: { select: { name: true, email: true, phone: true } },
      },
    }),
    db.property.findMany({
      where: { landlordId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
  ]);

  const [
    totalProperties,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    activeStats,
    recentBookings,
    recentProperties,
  ] = stats;

  const totalActiveValue = activeStats._sum.price?.toNumber() || 0;
  const activePropertiesCount = activeStats._count;

  const bookingStats = [
    { label: "待确认", value: pendingBookings, color: "bg-amber-500", icon: Clock },
    { label: "已确认", value: confirmedBookings, color: "bg-green-500", icon: CheckCircle },
  ];

  const cards = [
    {
      title: "房源总数",
      value: totalProperties,
      icon: Home,
      color: "bg-blue-500",
      href: "/landlord/properties",
    },
    {
      title: "预约总数",
      value: totalBookings,
      icon: Calendar,
      color: "bg-green-500",
      href: "/landlord/bookings",
    },
    {
      title: "在租房源",
      value: activePropertiesCount,
      icon: Eye,
      color: "bg-amber-500",
      href: "/landlord/properties?status=ACTIVE",
    },
    {
      title: "月租金总额",
      value: formatCurrency(totalActiveValue),
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/landlord/properties?status=ACTIVE",
    },
  ];

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

  const propertyStatusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    RENTED: "bg-blue-100 text-blue-700",
  };

  const propertyStatusLabels: Record<string, string> = {
    PENDING: "待审核",
    APPROVED: "已发布",
    REJECTED: "已拒绝",
    RENTED: "已出租",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">房东数据概览</h1>
          <p className="text-gray-500 mt-1">欢迎回来，{user.name}！这里是您的房源运营数据</p>
        </div>
        <Link
          href="/landlord/properties/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Home className="w-4 h-4 mr-2" />
          发布新房源
        </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">预约状态分布</h2>
            <Link href="/landlord/bookings" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookingStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">快速操作</h2>
          <div className="space-y-3">
            <Link
              href="/landlord/properties/create"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">发布新房源</span>
            </Link>
            <Link
              href="/landlord/bookings?status=PENDING"
              className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Clock className="w-5 h-5 text-amber-600 mr-3" />
              <span className="text-amber-700 font-medium">处理待确认预约</span>
              {pendingBookings > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingBookings}
                </span>
              )}
            </Link>
            <Link
              href="/landlord/properties"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-700 font-medium">管理房源</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最新预约</h2>
            <Link href="/landlord/bookings" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无预约记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">
                      {booking.tenant.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{booking.property.title}</p>
                    <p className="text-sm text-gray-500">{booking.tenant.name}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(booking.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status]}`}
                  >
                    {statusLabels[booking.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">我的房源</h2>
            <Link href="/landlord/properties" className="text-sm text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无房源</p>
              <Link
                href="/landlord/properties/create"
                className="inline-block mt-3 text-blue-600 hover:underline text-sm"
              >
                立即发布
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/landlord/properties/${property.id}/edit`}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {Array.isArray(property.images) && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{property.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(property.price)}/月 · {property._count.bookings} 次预约
                    </p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(property.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${propertyStatusColors[property.status]}`}
                  >
                    {propertyStatusLabels[property.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
