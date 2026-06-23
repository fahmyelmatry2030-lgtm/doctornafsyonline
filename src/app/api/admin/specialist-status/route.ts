import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/specialist-status
 * قيادة الشيفت يمكنها تسجيل/تحديث حالة الأخصائي
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SHIFT_LEADER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { specialistId, isOnline } = await req.json();
    if (!specialistId || isOnline === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // تحديث حالة الأخصائي
    const updatedUser = await prisma.user.update({
      where: { id: specialistId },
      data: { 
        isOnline,
        lastActivityAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        isOnline: true,
      },
    });

    // تسجيل في سجل الحالة الأونلاين
    await prisma.onlineStatusLog.create({
      data: {
        userId: specialistId,
        status: isOnline ? "ONLINE" : "OFFLINE",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      specialist: updatedUser,
      message: `تم تحديث حالة ${updatedUser.name} إلى ${isOnline ? "متاح" : "غير متاح"}`,
    });
  } catch (error) {
    console.error("[API] specialist-status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/specialist-status
 * احصل على حالة الأخصائيين
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SHIFT_LEADER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const specialistId = searchParams.get("specialistId");

    if (specialistId) {
      const specialist = await prisma.user.findUnique({
        where: { id: specialistId },
        select: {
          id: true,
          name: true,
          isOnline: true,
          lastActivityAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        specialist,
      });
    }

    // احصل على جميع الأخصائيين النشطين
    const specialists = await prisma.user.findMany({
      where: { role: "THERAPIST" },
      select: {
        id: true,
        name: true,
        isOnline: true,
        lastActivityAt: true,
      },
      orderBy: { lastActivityAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      specialists,
      onlineCount: specialists.filter((s) => s.isOnline).length,
      totalCount: specialists.length,
    });
  } catch (error) {
    console.error("[API] specialist-status GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
