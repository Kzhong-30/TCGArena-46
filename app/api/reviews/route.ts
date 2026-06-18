import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import type { ReviewFormData, ReviewWithDetails } from "@/types";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  RESCHEDULED: "RESCHEDULED",
} as const;

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as ReviewFormData;

    const {
      propertyId,
      rating,
      cleanliness,
      location,
      communication,
      value,
      comment,
    } = body;

    if (!propertyId || rating === undefined || rating === null) {
      return NextResponse.json(
        {
          success: false,
          error: "请填写房源ID和评分",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "评分必须在1-5之间",
        },
        { status: 400 }
      );
    }

    const validateRating = (value: number | undefined, field: string) => {
      if (value !== undefined && (value < 1 || value > 5)) {
        return NextResponse.json(
          {
            success: false,
            error: `${field}评分必须在1-5之间`,
          },
          { status: 400 }
        );
      }
      return null;
    };

    const errors = [
      validateRating(cleanliness, "清洁度"),
      validateRating(location, "位置"),
      validateRating(communication, "沟通"),
      validateRating(value, "性价比"),
    ].filter(Boolean);

    if (errors.length > 0) {
      return errors[0] as NextResponse;
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true, landlordId: true },
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

    if (property.landlordId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "不能评价自己发布的房源",
        },
        { status: 400 }
      );
    }

    const completedBooking = await db.booking.findFirst({
      where: {
        propertyId,
        tenantId: user.id,
        status: BOOKING_STATUS.COMPLETED,
      },
    });

    if (!completedBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "只有完成预约后才能评价该房源",
        },
        { status: 400 }
      );
    }

    const existingReview = await db.review.findFirst({
      where: {
        propertyId,
        tenantId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "您已经评价过该房源",
        },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        propertyId,
        tenantId: user.id,
        rating,
        cleanliness,
        location,
        communication,
        value,
        comment,
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
      },
    });

    const processedReview = {
      ...review,
      property: parsePropertyImages(review.property),
      tenant: review.tenant,
    };

    return NextResponse.json({
      success: true,
      data: processedReview,
      message: "评价提交成功",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "提交评价失败",
      },
      { status: 500 }
    );
  }
}
