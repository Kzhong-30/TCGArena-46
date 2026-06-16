import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import db from "@/lib/prisma";
import { validateEmail } from "@/lib/utils";
import { FULL_USER_SELECT } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "密码长度至少为6位" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "TENANT",
        phone: phone || null,
      },
      select: FULL_USER_SELECT,
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: "注册成功",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
