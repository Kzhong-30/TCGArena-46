import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { validatePhone } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireAuth();

    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取用户信息失败",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, phone, bio, image } = body;

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "请输入有效的手机号码",
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "没有需要更新的内容",
        },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "个人信息更新成功",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新用户信息失败",
      },
      { status: 500 }
    );
  }
}
