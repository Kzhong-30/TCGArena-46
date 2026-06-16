import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { Conversation } from "@/types";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

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
          select: FULL_USER_SELECT,
        },
        receiver: {
          select: FULL_USER_SELECT,
        },
        property: true,
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

        let processedProperty = message.property
          ? parsePropertyImages(message.property)
          : undefined;

        conversationMap.set(conversationKey, {
          id: conversationKey,
          participant: otherUser as any,
          lastMessage: message as any,
          unreadCount,
          property: processedProperty as any,
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
