"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  MapPin,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const { data: session } = useSession() ?? {};
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get("/api/messages/unread");
        if (response.data.success) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error) {
        console.error("获取未读消息数量失败:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/properties" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">城市租房</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/properties"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                找房源
              </Link>
              <Link
                href="/properties?view=map"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center"
              >
                <MapPin className="w-4 h-4 mr-1" />
                地图找房
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  注册
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {session.user.role === "LANDLORD" && (
                  <Link
                    href="/landlord/properties/create"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    发布房源
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    管理后台
                  </Link>
                )}

                <Link
                  href="/messages"
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>

                      <Link
                        href="/tenant/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        个人中心
                      </Link>

                      {session.user.role === "LANDLORD" && (
                        <Link
                          href="/landlord/properties"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home className="w-4 h-4 mr-2" />
                          我的房源
                        </Link>
                      )}

                      {session.user.role === "TENANT" && (
                        <>
                          <Link
                            href="/tenant/bookings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Search className="w-4 h-4 mr-2" />
                            我的预约
                          </Link>
                          <Link
                            href="/tenant/favorites"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            我的收藏
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => signOut()}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
