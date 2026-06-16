import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { FULL_USER_SELECT, parsePropertyImages } from "@/lib/api-helpers";

const COMPLAINT_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

const COMPLAINT_STATUS_ARRAY = [
  COMPLAINT_STATUS.OPEN,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.RESOLVED,
  COMPLAINT_STATUS.CLOSED,
];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { id } = params;
    const body = await request.json();
    const { status, resolution } = body;

    const complaint = await db.complaint.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: "投诉不存在" }, { status: 404 });
    }

    if (status && !COMPLAINT_STATUS_ARRAY.includes(status)) {
      return NextResponse.json({ success: false, error: "无效的状态值" }, { status: 400 });
    }

    if (status === COMPLAINT_STATUS.RESOLVED && !resolution?.trim()) {
      return NextResponse.json({ success: false, error: "请输入处理结果" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    if (status === COMPLAINT_STATUS.IN_PROGRESS || status === COMPLAINT_STATUS.RESOLVED) {
      updateData.handlerId = admin.id;
    }

    const updatedComplaint = await db.complaint.update({
      where: { id },
      data: updateData,
      include: {
        property: true,
        complainant: { select: FULL_USER_SELECT },
        respondent: { select: FULL_USER_SELECT },
        handler: { select: FULL_USER_SELECT },
      },
    });

    let processedComplaint = updatedComplaint as any;
    if (updatedComplaint.property) {
      processedComplaint = {
        ...updatedComplaint,
        property: parsePropertyImages(updatedComplaint.property),
      };
    }

    const messages: Record<string, string> = {
      [COMPLAINT_STATUS.IN_PROGRESS]: "投诉已开始处理",
      [COMPLAINT_STATUS.RESOLVED]: "投诉已解决",
      [COMPLAINT_STATUS.CLOSED]: "投诉已关闭",
    };

    return NextResponse.json({
      success: true,
      data: processedComplaint,
      message: messages[status as keyof typeof messages] || "投诉状态已更新",
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "处理投诉失败" },
      { status: 500 }
    );
  }
}
