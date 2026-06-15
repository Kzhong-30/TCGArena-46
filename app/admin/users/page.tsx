"use client";

import { useState, useEffect } from "react";
import { Users, Search, Ban, Check, X, Eye, Loader2, Mail, Phone, Calendar, Home, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import type { User } from "@/types";

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

type UserWithCount = User & {
  _count: {
    properties: number;
    bookingsAsTenant: number;
    bookingsAsLandlord: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithCount | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (searchKeyword) params.append("keyword", searchKeyword);
      const { data } = await axios.get(`/api/admin/users?${params}`);
      if (data.success) {
        setUsers(data.data.data);
      }
    } catch (error) {
      toast.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchKeyword]);

  const handleToggleStatus = async (user: UserWithCount) => {
    const action = user.isActive ? "禁用" : "启用";
    if (!confirm(`确定要${action}用户"${user.name}"吗？`)) return;
    try {
      setActionLoading(user.id);
      const { data } = await axios.put(`/api/admin/users/${user.id}/toggle`);
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser(data.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `${action}失败`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-500 mt-1">管理平台所有用户</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱、电话..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        >
          <option value="">全部角色</option>
          <option value="TENANT">租客</option>
          <option value="LANDLORD">房东</option>
          <option value="ADMIN">管理员</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无用户数据</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统计</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">{user.name?.charAt(0) || "U"}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <Badge variant="success">正常</Badge>
                      ) : (
                        <Badge variant="danger">已禁用</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center"><Home className="w-3 h-3 mr-1" /> {user._count.properties}</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {user.role === "LANDLORD" ? user._count.bookingsAsLandlord : user._count.bookingsAsTenant}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatRelativeTime(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                        >
                          {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isActive ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">用户详情</h2>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">{selectedUser.name?.charAt(0) || "U"}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[selectedUser.role]}>{roleLabels[selectedUser.role]}</Badge>
                    {selectedUser.isActive ? (
                      <Badge variant="success">正常</Badge>
                    ) : (
                      <Badge variant="danger">已禁用</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">邮箱</p>
                    <p className="font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">电话</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">注册时间</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">发布房源</p>
                    <p className="font-medium text-gray-900">{selectedUser._count.properties} 个</p>
                  </div>
                </div>
              </div>
              {selectedUser.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">个人简介</p>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                disabled={actionLoading === selectedUser.id}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedUser.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                {actionLoading === selectedUser.id ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedUser.isActive ? "禁用用户" : "启用用户"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
