import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RENTED: "RENTED",
} as const;

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "请提供房源ID",
        },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        status: true,
        landlordId: true,
      },
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

    if (property.status !== PROPERTY_STATUS.APPROVED) {
      return NextResponse.json(
        {
          success: false,
          error: "该房源未审核通过，无法收藏",
        },
        { status: 400 }
      );
    }

    if (property.landlordId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "不能收藏自己发布的房源",
        },
        { status: 400 }
      );
    }

    const existingFavorite = await db.favorite.findFirst({
      where: {
        userId: user.id,
        propertyId,
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        {
          success: false,
          error: "该房源已在收藏列表中",
        },
        { status: 400 }
      );
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.id,
        propertyId,
      },
      include: {
        property: {
          include: {
            landlord: {
              select: FULL_USER_SELECT,
            },
            _count: {
              select: {
                bookings: true,
                reviews: true,
                favorites: true,
              },
            },
          },
        },
      },
    });

    const processedFavorite = {
      ...favorite,
      property: parsePropertyImages(favorite.property),
    };

    return NextResponse.json({
      success: true,
      data: processedFavorite,
      message: "收藏成功",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "添加收藏失败",
      },
      { status: 500 }
    );
  }
}
