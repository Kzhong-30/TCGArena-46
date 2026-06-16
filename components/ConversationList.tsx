"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search } from "lucide-react";
import axios from "axios";
import ConversationItem from "./ConversationItem";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import type { Conversation, ApiResponse } from "@/types";

interface ConversationListProps {
  currentUserId: string;
  selectedConversationId?: string;
}

export default function ConversationList({
  currentUserId,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<Conversation[]>>(
        "/api/messages/conversations"
      );
      if (response.data.success && response.data.data) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("获取会话列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) => {
    const participantName =
      conversation.participant.name?.toLowerCase() || "";
    const propertyTitle = conversation.property?.title.toLowerCase() || "";
    const lastMessageContent =
      conversation.lastMessage?.content.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      participantName.includes(query) ||
      propertyTitle.includes(query) ||
      lastMessageContent.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <EmptyState
            icon="MessageSquare"
            title="暂无对话"
            description={
              searchQuery
                ? "没有找到匹配的对话"
                : "开始与房东或租客聊天吧"
            }
          />
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${
                  selectedConversationId === conversation.id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <ConversationItem
                  conversation={conversation}
                  currentUserId={currentUserId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
