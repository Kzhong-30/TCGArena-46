"use client";

import { useState, useEffect } from "react";
import { Home, Search, Check, X, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import type { PropertyWithDetails } from "@/types";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  RENTED: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已发布",
  REJECTED: "已拒绝",
  RENTED: "已出租",
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithDetails | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchKeyword) params.append("keyword", searchKeyword);
      const { data } = await axios.get(`/api/admin/properties?${params}`);
      if (data.success) {
        setProperties(data.data.data);
      }
    } catch (error) {
      toast.error("获取房源列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, searchKeyword]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const { data } = await axios.put(`/api/admin/properties/${id}/approve`);
      if (data.success) {
        toast.success(data.message);
        fetchProperties();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "审核失败");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("请输入拒绝原因：");
    if (reason === null) return;
    try {
      setActionLoading(id);
      const { data } = await axios.put(`/api/admin/properties/${id}/reject`, { rejectionReason: reason });
      if (data.success) {
        toast.success(data.message);
        fetchProperties();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "拒绝失败");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">房源审核</h1>
          <p className="text-gray-500 mt-1">审核和管理平台房源</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索房源标题、地址、房东..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        >
          <option value="PENDING">待审核</option>
          <option value="APPROVED">已发布</option>
          <option value="REJECTED">已拒绝</option>
          <option value="RENTED">已出租</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无房源数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex gap-6">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <Home className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{property.address}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">{formatCurrency(property.price)}/月</p>
                    </div>
                    <Badge className={statusColors[property.status]}>{statusLabels[property.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{property.bedrooms}室{property.bathrooms}卫 · {property.area}㎡</span>
                    <span>房东: {property.landlord.name}</span>
                    <span>{formatRelativeTime(property.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      查看详情
                    </button>
                    {property.status === "PENDING" && (
                      <> 
                        <button
                          onClick={() => handleApprove(property.id)}
                          disabled={actionLoading === property.id}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(property.id)}
                          disabled={actionLoading === property.id}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === property.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                          拒绝
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">房源详情</h2>
                <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {selectedProperty.images.length > 0 ? (
                  <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{selectedProperty.title}</h3>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">价格</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedProperty.price)}/月</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">面积</p>
                  <p className="font-semibold text-gray-900">{selectedProperty.area} ㎡</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">户型</p>
                  <p className="font-semibold text-gray-900">{selectedProperty.bedrooms}室{selectedProperty.bathrooms}卫</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">地址</p>
                  <p className="font-semibold text-gray-900">{selectedProperty.address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">房东信息</p>
                <p className="font-semibold text-gray-900">{selectedProperty.landlord.name}</p>
                <p className="text-sm text-gray-500">{selectedProperty.landlord.email}</p>
                <p className="text-sm text-gray-500">{selectedProperty.landlord.phone}</p>
              </div>
            </div>
            {selectedProperty.status === "PENDING" && (
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => { handleReject(selectedProperty.id); setSelectedProperty(null); }}
                  disabled={actionLoading === selectedProperty.id}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedProperty.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "拒绝"}
                </button>
                <button
                  onClick={() => { handleApprove(selectedProperty.id); setSelectedProperty(null); }}
                  disabled={actionLoading === selectedProperty.id}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedProperty.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "审核通过"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
