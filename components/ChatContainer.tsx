"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import type { MessageWithDetails, ApiResponse, PaginatedResponse } from "@/types";

interface ChatContainerProps {
  initialMessages: MessageWithDetails[];
  currentUserId: string;
  receiverId: string;
  propertyId?: string;
}

export default function ChatContainer({
  initialMessages,
  currentUserId,
  receiverId,
  propertyId,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageWithDetails[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  const handleMessageSent = (newMessage: MessageWithDetails) => {
    setMessages((prev) => [...prev, newMessage]);
    setShouldScrollToBottom(true);
  };

  const refreshMessages = async () => {
    try {
      const params = new URLSearchParams();
      params.append("otherUserId", receiverId);
      if (propertyId) {
        params.append("propertyId", propertyId);
      }
      params.append("limit", "100");

      const response = await axios.get<
        ApiResponse<PaginatedResponse<MessageWithDetails>>
      >(`/api/messages?${params.toString()}`);

      if (response.data.success && response.data.data) {
        const sortedMessages = [...response.data.data.data].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("刷新消息失败:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [receiverId, propertyId]);

  return (
    <>
      <div
        ref={containerRef}
        id="messages-container"
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">还没有消息，开始聊天吧！</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const prevMessage = messages[index - 1];
              const showAvatar =
                !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        receiverId={receiverId}
        propertyId={propertyId}
        onMessageSent={handleMessageSent}
      />
    </>
  );
}
