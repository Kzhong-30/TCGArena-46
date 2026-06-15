"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import type { MessageWithDetails } from "@/types";

interface MessageBubbleProps {
  message: MessageWithDetails;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  showAvatar = true,
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return format(new Date(date), "HH:mm");
  };

  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;

    switch (message.status) {
      case "SENT":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "DELIVERED":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "READ":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {showAvatar && !isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {message.sender.image ? (
            <img
              src={message.sender.image}
              alt={message.sender.name || "头像"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {message.sender.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
      )}

      {!showAvatar && !isCurrentUser && <div className="w-8 flex-shrink-0" />}

      <div
        className={`max-w-[70%] ${
          isCurrentUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        <div
          className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}
