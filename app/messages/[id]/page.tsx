import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/session";
import { db } from "@/lib/prisma";
import ConversationList from "@/components/ConversationList";
import ChatContainer from "@/components/ChatContainer";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { ArrowLeft, Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { MessageWithDetails, User } from "@/types";
import { parseImages } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "对话详情 - 城市租房平台",
};

async function getMessages(
  userId: string,
  otherUserId: string,
  propertyId?: string
): Promise<MessageWithDetails[]> {
  const where: any = {
    OR: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };

  if (propertyId && propertyId !== "default") {
    where.propertyId = propertyId;
  }

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
        },
      },
    },
  });

  const unreadMessages = messages.filter(
    (msg) => msg.receiverId === userId && !msg.isRead
  );

  if (unreadMessages.length > 0) {
    await db.message.updateMany({
      where: {
        id: { in: unreadMessages.map((msg) => msg.id) },
      },
      data: {
        isRead: true,
        status: "READ",
      },
    });
  }

  const processedMessages = messages.map((msg) => ({
    ...msg,
    property: msg.property
      ? {
          ...msg.property,
          images: parseImages(msg.property.images as string | null),
        }
      : undefined,
  }));

  return processedMessages as unknown as MessageWithDetails[];
}

async function getOtherUser(otherUserId: string): Promise<User | null> {
  const result = await db.user.findUnique({
    where: { id: otherUserId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });
  return result as unknown as User | null;
}

async function getProperty(propertyId: string) {
  if (!propertyId || propertyId === "default") return null;
  return db.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      address: true,
    },
  });
}

function parseConversationId(id: string): {
  otherUserId: string;
  propertyId: string;
} {
  const parts = id.split("_");
  const propertyId = parts.pop() || "default";
  const otherUserId = parts.join("_");
  return { otherUserId, propertyId };
}

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/messages/${params.id}`);
  }

  await requireAuth();

  const { otherUserId, propertyId } = parseConversationId(params.id);

  if (otherUserId === user.id) {
    redirect("/messages");
  }

  const [messages, otherUser, property] = await Promise.all([
    getMessages(user.id, otherUserId, propertyId),
    getOtherUser(otherUserId),
    getProperty(propertyId),
  ]);

  if (!otherUser) {
    redirect("/messages");
  }

  const actualPropertyId = propertyId !== "default" ? propertyId : undefined;
  const propertyImages = property ? parseImages(property.images as string | null) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[calc(100vh-160px)]">
            <div className="hidden lg:block w-80 border-r border-gray-200">
              <ConversationList
                currentUserId={user.id}
                selectedConversationId={params.id}
              />
            </div>

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
                          alt={property!.title}
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

              <div
                id="messages-container"
                className="flex-1 overflow-y-auto p-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">
                      还没有消息，开始聊天吧！
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const isCurrentUser = message.senderId === user.id;
                      const prevMessage = messages[index - 1];
                      const showAvatar =
                        !prevMessage ||
                        prevMessage.senderId !== message.senderId;

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
              </div>

              <MessageInput
                receiverId={otherUserId}
                propertyId={actualPropertyId}
                onMessageSent={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
