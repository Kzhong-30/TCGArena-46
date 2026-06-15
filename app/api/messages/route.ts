import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { MessageStatus } from "@prisma/client";
import type { MessageFormData, MessageWithDetails, PaginatedResponse } from "@/types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const otherUserId = searchParams.get("otherUserId") || undefined;
    const propertyId = searchParams.get("propertyId") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { senderId: user.id },
        { receiverId: user.id },
      ],
    };

    if (otherUserId) {
      where.OR = [
        { senderId: user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user.id },
      ];
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
      }),
      db.message.count({ where }),
    ]);

    const unreadMessages = messages.filter(
      (msg) => msg.receiverId === user.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await db.message.updateMany({
        where: {
          id: { in: unreadMessages.map((msg) => msg.id) },
        },
        data: {
          isRead: true,
          status: MessageStatus.READ,
        },
      });
    }

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<MessageWithDetails> = {
      data: messages,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取消息列表失败",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as MessageFormData;

    const { receiverId, propertyId, content } = body;

    if (!receiverId || !content || content.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "请填写接收者和消息内容",
        },
        { status: 400 }
      );
    }

    if (receiverId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "不能给自己发送消息",
        },
        { status: 400 }
      );
    }

    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json(
        {
          success: false,
          error: "接收者不存在",
        },
        { status: 404 }
      );
    }

    if (propertyId) {
      const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { id: true },
      });

      if (!property) {
        return NextResponse.json(
          {
            success: false,
            error: "房源不存在",
          },
          { status: 404 }
        );
      }
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId,
        propertyId,
        content: content.trim(),
        status: MessageStatus.SENT,
      },
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

    return NextResponse.json({
      success: true,
      data: message,
      message: "消息发送成功",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "发送消息失败",
      },
      { status: 500 }
    );
  }
}
