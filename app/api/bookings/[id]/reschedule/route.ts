import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  RESCHEDULED: "RESCHEDULED",
} as const;

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

    if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.REJECTED) {
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
        status: BOOKING_STATUS.RESCHEDULED,
      },
      include: {
        property: {
          include: {
            landlord: {
              select: FULL_USER_SELECT,
            },
          },
        },
        tenant: {
          select: FULL_USER_SELECT,
        },
        landlord: {
          select: FULL_USER_SELECT,
        },
      },
    });

    const processedBooking = {
      ...updatedBooking,
      property: parsePropertyImages(updatedBooking.property),
    };

    return NextResponse.json({
      success: true,
      data: processedBooking,
      message: "预约改期成功",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
