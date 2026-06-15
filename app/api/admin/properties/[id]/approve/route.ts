import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PropertyStatus } from "@prisma/client";

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

    if (property.status !== PropertyStatus.PENDING) {
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
        status: PropertyStatus.APPROVED,
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

    return NextResponse.json({
      success: true,
      data: updatedProperty,
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
