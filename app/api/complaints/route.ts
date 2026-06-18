import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import db from "@/lib/prisma";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, type, propertyId, respondentId, priority } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const complaint = await db.complaint.create({
      data: {
        title,
        description,
        type,
        propertyId: propertyId || null,
        complainantId: user.id,
        respondentId: respondentId || null,
        priority: priority || "MEDIUM",
      },
      include: {
        property: true,
        complainant: {
          select: FULL_USER_SELECT,
        },
        respondent: {
          select: FULL_USER_SELECT,
        },
      },
    });

    const processedComplaint = complaint.property
      ? { ...complaint, property: parsePropertyImages(complaint.property) }
      : complaint;

    return NextResponse.json({
      success: true,
      data: processedComplaint,
      message: "投诉提交成功，我们会尽快处理",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Create complaint error:", error);
    return NextResponse.json(
      { success: false, message: "提交失败，请稍后重试" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const where: any = {
      OR: [
        { complainantId: user.id },
        { respondentId: user.id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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

    return NextResponse.json({
      success: true,
      data: processedComplaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Get complaints error:", error);
    return NextResponse.json(
      { success: false, message: "获取失败，请稍后重试" },
      { status: 500 }
    );
  }
}
