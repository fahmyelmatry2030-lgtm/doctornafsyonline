import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * API للإنشاء السريع لـ Shift Leader اختبار
 * POST بدون معاملات - ينشئ حساب shift leader اختبار
 */
export async function POST() {
  try {
    // التحقق من الـ Admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create shift leaders" },
        { status: 403 }
      );
    }

    // فحص وجود shift leader اختبار موجود بالفعل
    const existing = await prisma.user.findUnique({
      where: { email: "shiftleader@test.com" },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Shift leader already exists",
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: existing.role,
        },
      });
    }

    // إنشاء shift leader اختبار
    const hashedPassword = await bcrypt.hash("TestPassword123", 10);

    const newShiftLeader = await prisma.user.create({
      data: {
        email: "shiftleader@test.com",
        name: "قائد الشيفت التجريبي",
        password: hashedPassword,
        role: "SHIFT_LEADER",
        isOnline: true,
        isSuspended: false,
        phone: "+966501234567",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shift leader created successfully",
      user: {
        id: newShiftLeader.id,
        email: newShiftLeader.email,
        name: newShiftLeader.name,
        role: newShiftLeader.role,
      },
      loginInfo: {
        email: "shiftleader@test.com",
        password: "TestPassword123",
        note: "استخدم هذه البيانات للدخول واختبار الصفحة",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - عرض معلومات shift leaders الموجودة
 */
export async function GET() {
  try {
    const shiftLeaders = await prisma.user.findMany({
      where: { role: "SHIFT_LEADER" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isOnline: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: shiftLeaders.length,
      shiftLeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
