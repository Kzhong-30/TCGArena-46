import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RENTED: "RENTED",
} as const;

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = params;

    const property = await db.property.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
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

    if (property.status !== PROPERTY_STATUS.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: "只有待审核的房源可以通过",
        },
        { status: 400 }
      );
    }

    const updatedProperty = await db.property.update({
      where: { id },
      data: {
        status: PROPERTY_STATUS.APPROVED,
      },
      include: {
        landlord: {
          select: FULL_USER_SELECT,
        },
        reviews: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    const processedProperty = parsePropertyImages(updatedProperty);

    return NextResponse.json({
      success: true,
      data: processedProperty,
      message: "房源审核通过",
    });
  } catch (error) {
    console.error("Error approving property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "审核房源失败",
      },
      { status: 500 }
    );
  }
}
