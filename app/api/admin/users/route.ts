import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { PaginatedResponse, User } from "@/types";
import { FULL_USER_SELECT } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const role = searchParams.get("role") || undefined;
    const keyword = searchParams.get("keyword") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
        { phone: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          ...FULL_USER_SELECT,
          _count: {
            select: {
              properties: true,
              bookingsAsTenant: true,
              bookingsAsLandlord: true,
              reviewsAsTenant: true,
              favorites: true,
              sentMessages: true,
              receivedMessages: true,
              complaintsFiled: true,
              complaintsReceived: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
      data: users,
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
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取用户列表失败",
      },
      { status: 500 }
    );
  }
}
