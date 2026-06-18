import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireAuth();

    const unreadCount = await db.message.count({
      where: {
        receiverId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("获取未读消息数量失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取未读消息数量失败",
      },
      { status: 500 }
    );
  }
}
