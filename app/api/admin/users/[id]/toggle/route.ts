import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { FULL_USER_SELECT } from "@/lib/api-helpers";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { id } = params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在",
        },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN" && user.id !== admin.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无法禁用其他管理员账户",
        },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: {
        ...FULL_USER_SELECT,
        _count: {
          select: {
            properties: true,
            bookingsAsTenant: true,
            bookingsAsLandlord: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: updatedUser.isActive ? "用户已启用" : "用户已禁用",
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新用户状态失败",
      },
      { status: 500 }
    );
  }
}
