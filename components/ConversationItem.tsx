"use client";

import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

export default function ConversationItem({
  conversation,
  currentUserId,
}: ConversationItemProps) {
  const { participant, lastMessage, unreadCount, property } = conversation;

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return format(messageDate, "HH:mm");
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return format(messageDate, "EEEE", { locale: zhCN });
    } else {
      return format(messageDate, "MM/dd");
    }
  };

  const isSentByCurrentUser = lastMessage?.senderId === currentUserId;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg overflow-hidden">
          {participant.image ? (
            <img
              src={participant.image}
              alt={participant.name || "用户头像"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{participant.name?.charAt(0).toUpperCase() || "U"}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {participant.name || "未知用户"}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {property && (
          <div className="text-xs text-blue-600 mt-0.5 truncate">
            关于: {property.title}
          </div>
        )}

        <div className="flex items-center mt-1">
          {lastMessage && (
            <p
              className={`text-sm truncate flex-1 ${
                unreadCount > 0 && !isSentByCurrentUser
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              {isSentByCurrentUser && "我: "}
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
