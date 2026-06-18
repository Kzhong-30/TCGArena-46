import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { PaginatedResponse, ComplaintWithDetails } from "@/types";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          property: true,
          complainant: {
            select: FULL_USER_SELECT,
          },
          respondent: {
            select: FULL_USER_SELECT,
          },
          handler: {
            select: FULL_USER_SELECT,
          },
        },
      }),
      db.complaint.count({ where }),
    ]);

    const processedComplaints = complaints.map((c) => {
      if (c.property) {
        return {
          ...c,
          property: parsePropertyImages(c.property),
        };
      }
      return c;
    });

    const totalPages = Math.ceil(total / limit);

    const response = {
      data: processedComplaints,
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
    console.error("Error fetching admin complaints:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取投诉列表失败",
      },
      { status: 500 }
    );
  }
}
