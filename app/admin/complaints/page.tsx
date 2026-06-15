"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Search, Check, X, Eye, Loader2, MessageSquare, User, Home as HomeIcon, Clock } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import type { ComplaintWithDetails } from "@/types";

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  OPEN: "待处理",
  IN_PROGRESS: "处理中",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-green-100 text-green-700",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithDetails | null>(null);
  const [resolution, setResolution] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      const { data } = await axios.get(`/api/admin/complaints?${params}`);
      if (data.success) {
        setComplaints(data.data.data);
      }
    } catch (error) {
      toast.error("获取投诉列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatus = async (id: string, status: string, resolutionText?: string) => {
    try {
      setActionLoading(id);
      const { data } = await axios.put(`/api/admin/complaints/${id}`, { status, resolution: resolutionText });
      if (data.success) {
        toast.success(data.message);
        fetchComplaints();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(data.data);
        }
        setResolution("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "处理失败");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投诉处理</h1>
          <p className="text-gray-500 mt-1">处理和管理平台投诉</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        >
          <option value="">全部状态</option>
          <option value="OPEN">待处理</option>
          <option value="IN_PROGRESS">处理中</option>
          <option value="RESOLVED">已解决</option>
          <option value="CLOSED">已关闭</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        >
          <option value="">全部类型</option>
          <option value="PROPERTY">房源问题</option>
          <option value="LANDLORD">房东问题</option>
          <option value="TENANT">租客问题</option>
          <option value="OTHER">其他问题</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无投诉数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                    <Badge className={statusColors[complaint.status]}>{statusLabels[complaint.status]}</Badge>
                    {complaint.priority && <Badge className={priorityColors[complaint.priority]}>{complaint.priority}</Badge>}
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">{complaint.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center"><User className="w-4 h-4 mr-1" /> 投诉人: {complaint.complainant.name}</span>
                    {complaint.respondent && <span className="flex items-center"><User className="w-4 h-4 mr-1" /> 被投诉人: {complaint.respondent.name}</span>}
                    {complaint.property && <span className="flex items-center"><HomeIcon className="w-4 h-4 mr-1" /> {complaint.property.title}</span>}
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {formatRelativeTime(complaint.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedComplaint(complaint); setResolution(complaint.resolution || ""); }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    查看详情
                  </button>
                  {complaint.status === "OPEN" && (
                    <button
                      onClick={() => handleUpdateStatus(complaint.id, "IN_PROGRESS")}
                      disabled={actionLoading === complaint.id}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === complaint.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                      开始处理
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">投诉详情</h2>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedComplaint.title}</h3>
                  <Badge className={statusColors[selectedComplaint.status]}>{statusLabels[selectedComplaint.status]}</Badge>
                  {selectedComplaint.priority && <Badge className={priorityColors[selectedComplaint.priority]}>{selectedComplaint.priority}</Badge>}
                </div>
                <p className="text-gray-600">{selectedComplaint.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">投诉类型</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">投诉时间</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">投诉人</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.complainant.name}</p>
                  <p className="text-sm text-gray-500">{selectedComplaint.complainant.email}</p>
                </div>
                {selectedComplaint.respondent && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">被投诉人</p>
                    <p className="font-medium text-gray-900">{selectedComplaint.respondent.name}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.respondent.email}</p>
                  </div>
                )}
              </div>
              {selectedComplaint.property && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">相关房源</p>
                  <p className="font-medium text-gray-900">{selectedComplaint.property.title}</p>
                </div>
              )}
              {selectedComplaint.resolution && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1 font-medium">处理结果</p>
                  <p className="text-gray-700">{selectedComplaint.resolution}</p>
                </div>
              )}
              {(selectedComplaint.status === "OPEN" || selectedComplaint.status === "IN_PROGRESS") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">处理结果</label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="请输入处理结果..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              {selectedComplaint.status === "OPEN" && (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, "IN_PROGRESS")}
                  disabled={actionLoading === selectedComplaint.id}
                  className="px-6 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedComplaint.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "开始处理"}
                </button>
              )}
              {(selectedComplaint.status === "OPEN" || selectedComplaint.status === "IN_PROGRESS") && (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, "RESOLVED", resolution)}
                  disabled={actionLoading === selectedComplaint.id || !resolution.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedComplaint.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "标记已解决"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
