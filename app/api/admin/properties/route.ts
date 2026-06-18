import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { PaginatedResponse, PropertyWithDetails } from "@/types";
import { FULL_USER_SELECT, parsePropertiesImages } from "@/lib/api-helpers";

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
            select: FULL_USER_SELECT,
          },
          reviews: {
            include: {
              tenant: {
                select: FULL_USER_SELECT,
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

    const processedProperties = properties.map((p) => {
      const parsed = parsePropertiesImages([p])[0];
      return {
        ...parsed,
        reviews: p.reviews.map((r) => ({
          ...r,
          tenant: r.tenant,
        })),
      };
    });

    const totalPages = Math.ceil(total / limit);

    const response = {
      data: processedProperties,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
