"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type { MessageWithDetails, ApiResponse, MessageFormData } from "@/types";

interface MessageInputProps {
  receiverId: string;
  propertyId?: string;
  onMessageSent: (message: MessageWithDetails) => void;
}

export default function MessageInput({
  receiverId,
  propertyId,
  onMessageSent,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const messageData: MessageFormData = {
        receiverId,
        propertyId,
        content: content.trim(),
      };

      const response = await axios.post<ApiResponse<MessageWithDetails>>(
        "/api/messages",
        messageData
      );

      if (response.data.success && response.data.data) {
        onMessageSent(response.data.data);
        setContent("");
      } else {
        toast.error(response.data.error || "发送消息失败");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      toast.error("发送消息失败，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          disabled={sending}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            disabled={sending}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            style={{ maxHeight: "120px", minHeight: "48px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className={`p-3 rounded-full transition-colors flex-shrink-0 ${
            content.trim() && !sending
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
