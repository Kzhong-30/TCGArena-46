import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { Conversation } from "@/types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
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

    for (const message of messages) {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
      const propertyId = message.propertyId || "default";
      const conversationKey = `${otherUserId}_${propertyId}`;

      if (!conversationMap.has(conversationKey)) {
        const otherUser = message.senderId === user.id ? message.receiver : message.sender;
        const unreadCount = messages.filter(
          (m) =>
            m.senderId === otherUserId &&
            m.receiverId === user.id &&
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

    const conversations = Array.from(conversationMap.values()).sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || new Date(0);
      const dateB = b.lastMessage?.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取会话列表失败",
      },
      { status: 500 }
    );
  }
}
