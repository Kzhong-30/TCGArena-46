import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { BookingStatus } from "@prisma/client";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    const { preferredDate, preferredTime, alternateDate, alternateTime, rescheduleNote } = body;

    if (!preferredDate || !preferredTime) {
      return NextResponse.json(
        {
          success: false,
          error: "请填写新的预约日期和时间",
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
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

    if (user.role !== "ADMIN" && booking.tenantId !== user.id && booking.landlordId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权限修改此预约",
        },
        { status: 403 }
      );
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
      return NextResponse.json(
        {
          success: false,
          error: "已取消或已拒绝的预约无法改期",
        },
        { status: 400 }
      );
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        preferredDate: new Date(preferredDate),
        preferredTime,
        alternateDate: alternateDate ? new Date(alternateDate) : undefined,
        alternateTime,
        rescheduleNote,
        status: BookingStatus.RESCHEDULED,
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
      message: "预约改期成功",
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "改期预约失败",
      },
      { status: 500 }
    );
  }
}
