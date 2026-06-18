import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const favorite = await db.favorite.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        {
          success: false,
          error: "收藏不存在",
        },
        { status: 404 }
      );
    }

    if (favorite.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权限删除此收藏",
        },
        { status: 403 }
      );
    }

    await db.favorite.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "取消收藏失败",
      },
      { status: 500 }
    );
  }
}
