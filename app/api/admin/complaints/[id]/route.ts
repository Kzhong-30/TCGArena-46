import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ComplaintStatus } from "@prisma/client";

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

    const validStatuses = [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "无效的状态值" }, { status: 400 });
    }

    if (status === ComplaintStatus.RESOLVED && !resolution?.trim()) {
      return NextResponse.json({ success: false, error: "请输入处理结果" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    if (status === ComplaintStatus.IN_PROGRESS || status === ComplaintStatus.RESOLVED) {
      updateData.handlerId = admin.id;
    }

    const updatedComplaint = await db.complaint.update({
      where: { id },
      data: updateData,
      include: {
        property: { select: { id: true, title: true, price: true, images: true } },
        complainant: { select: { id: true, name: true, email: true, phone: true, image: true } },
        respondent: { select: { id: true, name: true, email: true, phone: true, image: true } },
        handler: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    const messages = {
      [ComplaintStatus.IN_PROGRESS]: "投诉已开始处理",
      [ComplaintStatus.RESOLVED]: "投诉已解决",
      [ComplaintStatus.CLOSED]: "投诉已关闭",
    };

    return NextResponse.json({
      success: true,
      data: updatedComplaint,
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
