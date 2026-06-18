"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import ChatContainer from "@/components/ChatContainer";
import type { MessageWithDetails, User } from "@/types";
import { parseImages } from "@/lib/utils";

interface ConversationClientProps {
  initialMessages: MessageWithDetails[];
  currentUserId: string;
  otherUser: User;
  property: {
    id: string;
    title: string;
    price: number;
    images: string | null;
    address?: string | null;
  } | null;
  conversationId: string;
  actualPropertyId?: string;
}

export default function ConversationClient({
  initialMessages,
  currentUserId,
  otherUser,
  property,
  conversationId,
  actualPropertyId,
}: ConversationClientProps) {
  const [propertyImages, setPropertyImages] = useState<string[]>([]);

  useEffect(() => {
    if (property?.images) {
      setPropertyImages(parseImages(property.images));
    }
  }, [property]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>

          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium overflow-hidden">
            {otherUser.image ? (
              <img
                src={otherUser.image}
                alt={otherUser.name || "头像"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {otherUser.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">
              {otherUser.name || "未知用户"}
            </h2>
            <p className="text-sm text-gray-500">
              {otherUser.role === "LANDLORD" ? "房东" : "租客"}
            </p>
          </div>
        </div>

        {property && (
          <Link
            href={`/properties/${property.id}`}
            className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {propertyImages.length > 0 ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={propertyImages[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {property.title}
              </p>
              <p className="text-sm text-blue-600">
                ¥{property.price}/月
              </p>
            </div>
          </Link>
        )}
      </div>

      <ChatContainer
        initialMessages={initialMessages}
        currentUserId={currentUserId}
        receiverId={otherUser.id}
        propertyId={actualPropertyId}
      />
    </div>
  );
}
