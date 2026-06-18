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
    const body = await request.json();
    const { rejectionReason } = body;

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
          error: "只有待审核的房源可以拒绝",
        },
        { status: 400 }
      );
    }

    const updatedProperty = await db.property.update({
      where: { id },
      data: {
        status: PROPERTY_STATUS.REJECTED,
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

    if (rejectionReason) {
      const landlord = updatedProperty.landlord;
      await db.message.create({
        data: {
          senderId: "system",
          receiverId: landlord.id,
          content: `您发布的房源"${updatedProperty.title}"审核被拒绝。原因：${rejectionReason}`,
          propertyId: id,
        },
      });
    }

    const processedProperty = parsePropertyImages(updatedProperty);

    return NextResponse.json({
      success: true,
      data: processedProperty,
      message: "房源已拒绝",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Error rejecting property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "拒绝房源失败",
      },
      { status: 500 }
    );
  }
}
