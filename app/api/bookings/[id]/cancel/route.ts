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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();
    const { cancelReason } = body;

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
        { success: false, error: "预约不存在" },
        { status: 404 }
      );
    }

    if (booking.tenantId !== user.id && booking.landlordId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "无权限取消此预约" },
        { status: 403 }
      );
    }

    if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.REJECTED || booking.status === BOOKING_STATUS.COMPLETED) {
      return NextResponse.json(
        { success: false, error: "该预约状态不允许取消" },
        { status: 400 }
      );
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: BOOKING_STATUS.CANCELLED,
        rejectionReason: cancelReason || "用户取消",
      },
      include: {
        property: {
          include: {
            landlord: { select: FULL_USER_SELECT },
          },
        },
        tenant: { select: FULL_USER_SELECT },
        landlord: { select: FULL_USER_SELECT },
      },
    });

    const processedBooking = {
      ...updatedBooking,
      property: parsePropertyImages(updatedBooking.property),
    };

    return NextResponse.json({
      success: true,
      data: processedBooking,
      message: "预约已取消",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "取消预约失败" },
      { status: 500 }
    );
  }
}
