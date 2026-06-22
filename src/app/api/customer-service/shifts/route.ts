import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customer-service/shifts
 * الحصول على جميع الفترات (Shifts)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["ADMIN", "ADMIN_CUSTOMER_SERVICE"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const shifts = await prisma.shift.findMany({
      where: { isActive: true },
      include: {
        specialistAssignments: {
          where: { isActive: true },
          include: {
            therapist: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      shifts: shifts.map((shift) => ({
        id: shift.id,
        name: shift.name,
        dayOfWeek: shift.dayOfWeek,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description,
        specialistsCount: shift.specialistAssignments.length,
        specialists: shift.specialistAssignments.map((a) => ({
          id: a.therapist.id,
          name: a.therapist.name,
          email: a.therapist.email,
        })),
      })),
    });
  } catch (error) {
    console.error("[API] shifts GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer-service/shifts
 * إنشاء فترة عمل جديدة
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, dayOfWeek, startTime, endTime, description } = body;

    if (!name || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        dayOfWeek,
        startTime,
        endTime,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      shift,
    });
  } catch (error) {
    console.error("[API] shifts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customer-service/shifts/[id]/assign
 * إضافة أخصائي إلى فترة عمل
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { shiftId, therapistId, action } = body; // action: "add" or "remove"

    if (!shiftId || !therapistId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === "add") {
      const assignment = await prisma.specialistShiftAssignment.create({
        data: {
          shiftId,
          therapistId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "تم إضافة الأخصائي إلى الفترة بنجاح",
        assignment,
      });
    } else if (action === "remove") {
      await prisma.specialistShiftAssignment.update({
        where: {
          shiftId_therapistId: {
            shiftId,
            therapistId,
          },
        },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "تم إزالة الأخصائي من الفترة بنجاح",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API] shifts assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
