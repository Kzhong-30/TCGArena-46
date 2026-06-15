import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { BookingStatus } from "@prisma/client";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const booking = await db.booking.findUnique({
      where: { id },
      select: {
        id: true,
        landlordId: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "预约不存在",
        },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && booking.landlordId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权限确认此预约",
        },
        { status: 403 }
      );
    }

    if (booking.status !== BookingStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: "只有待处理的预约可以确认",
        },
        { status: 400 }
      );
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        property: {
          include: {
            landlord: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: "预约确认成功",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "确认预约失败",
      },
      { status: 500 }
    );
  }
}
