import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PropertyStatus } from "@prisma/client";

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

    if (property.status !== PropertyStatus.PENDING) {
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
        status: PropertyStatus.REJECTED,
      },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
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

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: "房源已拒绝",
    });
  } catch (error) {
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
