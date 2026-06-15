import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PropertyStatus } from "@prisma/client";
import type { PaginatedResponse, PropertyWithDetails } from "@/types";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const status = searchParams.get("status") || undefined;
    const keyword = searchParams.get("keyword") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { address: { contains: keyword, mode: "insensitive" } },
        {
          landlord: {
            name: { contains: keyword, mode: "insensitive" },
          },
        },
      ];
    }

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
          reviews: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      db.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<PropertyWithDetails> = {
      data: properties,
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
    console.error("Error fetching admin properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取房源列表失败",
      },
      { status: 500 }
    );
  }
}
