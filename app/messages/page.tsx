import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/session";
import { db } from "@/lib/prisma";
import ConversationList from "@/components/ConversationList";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import type { Conversation, MessageWithDetails, User } from "@/types";

export const metadata = {
  title: "消息 - 城市租房平台",
  description: "查看和管理您的消息",
};

async function getConversations(userId: string): Promise<Conversation[]> {
  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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

  const conversationMap = new Map<string, Conversation>();

  for (const message of messages as (MessageWithDetails & {
    sender: User;
    receiver: User;
  })[]) {
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    const propertyId = message.propertyId || "default";
    const conversationKey = `${otherUserId}_${propertyId}`;

    if (!conversationMap.has(conversationKey)) {
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      const unreadCount = messages.filter(
        (m) =>
          m.senderId === otherUserId &&
          m.receiverId === userId &&
          !m.isRead &&
          (m.propertyId || "default") === propertyId
      ).length;

      conversationMap.set(conversationKey, {
        id: conversationKey,
        participant: otherUser,
        lastMessage: message,
        unreadCount,
        property: message.property || undefined,
      });
    }
  }

  return Array.from(conversationMap.values()).sort((a, b) => {
    const dateA = a.lastMessage?.createdAt || new Date(0);
    const dateB = b.lastMessage?.createdAt || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/messages");
  }

  await requireAuth();

  const conversations = await getConversations(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">消息</h1>
          <p className="text-gray-500 mt-1">与房东和租客保持联系</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:hidden">
            <ConversationList
              currentUserId={user.id}
            />
          </div>

          <div className="hidden lg:block">
            <div className="flex">
              <div className="w-80 border-r border-gray-200">
                <ConversationList
                  currentUserId={user.id}
                />
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <EmptyState
                  icon={<MessageSquare className="w-16 h-16 text-gray-300" />}
                  title="选择一个对话开始聊天"
                  description="从左侧列表中选择一个对话，开始与房东或租客交流"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
