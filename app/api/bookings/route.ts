import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { BookingStatus, PropertyStatus } from "@prisma/client";
import type { BookingFormData, BookingWithDetails, PaginatedResponse } from "@/types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const status = searchParams.get("status") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (user.role === "TENANT") {
      where.tenantId = user.id;
    } else if (user.role === "LANDLORD") {
      where.landlordId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
      }),
      db.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<BookingWithDetails> = {
      data: bookings,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取预约列表失败",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as BookingFormData;

    const {
      propertyId,
      preferredDate,
      preferredTime,
      alternateDate,
      alternateTime,
      message,
      numberOfPeople,
    } = body;

    if (!propertyId || !preferredDate || !preferredTime) {
      return NextResponse.json(
        {
          success: false,
          error: "请填写所有必填字段",
        },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        landlordId: true,
        status: true,
        listingStatus: true,
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

    if (property.status !== PropertyStatus.APPROVED) {
      return NextResponse.json(
        {
          success: false,
          error: "房源未审核通过，无法预约",
        },
        { status: 400 }
      );
    }

    if (property.landlordId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "不能预约自己发布的房源",
        },
        { status: 400 }
      );
    }

    const existingBooking = await db.booking.findFirst({
      where: {
        propertyId,
        tenantId: user.id,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "您已有该房源的待处理或已确认预约",
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        propertyId,
        tenantId: user.id,
        landlordId: property.landlordId,
        preferredDate: new Date(preferredDate),
        preferredTime,
        alternateDate: alternateDate ? new Date(alternateDate) : undefined,
        alternateTime,
        message,
        numberOfPeople,
        status: BookingStatus.PENDING,
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
      data: booking,
      message: "预约提交成功，等待房东确认",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建预约失败",
      },
      { status: 500 }
    );
  }
}
