import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/customer-service/check-conflict
 * 
 * التحقق من عدم وجود تعارض في مواعيد الجلسات
 * 
 * Body:
 * {
 *   therapistId: string,
 *   patientId: string,
 *   scheduledAt: ISO DateTime string,
 *   duration: number (minutes, optional, default 50)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role
    const allowedRoles = ["ADMIN", "ADMIN_CUSTOMER_SERVICE", "ADMIN_HR", "SHIFT_LEADER", "THERAPIST"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { therapistId, patientId, scheduledAt, duration = 50, appointmentIdToExclude } = body;

    // Validate required fields
    if (!therapistId || !patientId || !scheduledAt) {
      return NextResponse.json(
        {
          error: "Missing required fields: therapistId, patientId, scheduledAt",
          hasConflict: false,
        },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(scheduledAt);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledAt format" },
        { status: 400 }
      );
    }

    const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);

    // Check for therapist conflicts
    const therapistConflict = await prisma.appointment.findFirst({
      where: {
        therapistId,
        id: { not: appointmentIdToExclude },
        status: { in: ["CONFIRMED", "PENDING", "IN_PROGRESS"] },
        scheduledAt: {
          lt: appointmentEnd,
        },
        OR: [
          {
            // Check if new appointment overlaps with existing
          },
        ],
      },
    });

    // More precise conflict check using raw query or logic
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        therapistId,
        id: { not: appointmentIdToExclude },
        status: { in: ["CONFIRMED", "PENDING", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
      },
    });

    let hasTherapistConflict = false;
    let conflictingAppointment = null;

    for (const existingAppt of existingAppointments) {
      const existingEnd = new Date(
        new Date(existingAppt.scheduledAt).getTime() + existingAppt.duration * 60000
      );
      const existingStart = new Date(existingAppt.scheduledAt);

      // Check if time ranges overlap
      if (appointmentDate < existingEnd && appointmentEnd > existingStart) {
        hasTherapistConflict = true;
        conflictingAppointment = existingAppt;
        break;
      }
    }

    // Check for patient conflicts
    const patientConflict = await prisma.appointment.findFirst({
      where: {
        patientId,
        id: { not: appointmentIdToExclude },
        status: { in: ["CONFIRMED", "PENDING", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
      },
    });

    let hasPatientConflict = false;
    if (patientConflict) {
      const patientConflictEnd = new Date(
        new Date(patientConflict.scheduledAt).getTime() + patientConflict.duration * 60000
      );
      const patientConflictStart = new Date(patientConflict.scheduledAt);

      if (appointmentDate < patientConflictEnd && appointmentEnd > patientConflictStart) {
        hasPatientConflict = true;
      }
    }

    const hasConflict = hasTherapistConflict || hasPatientConflict;

    return NextResponse.json({
      success: true,
      hasConflict,
      therapistConflict: hasTherapistConflict
        ? {
            conflictingAppointmentId: conflictingAppointment?.id,
            conflictingTime: conflictingAppointment?.scheduledAt,
          }
        : null,
      patientConflict: hasPatientConflict
        ? {
            message: "المريض لديه جلسة أخرى في نفس الوقت",
          }
        : null,
      message: hasConflict
        ? "⚠️ تعارض في الجدول - لا يمكن حجز هذا الموعد"
        : "✅ لا توجد تعارضات - يمكن حجز الموعد",
    });
  } catch (error) {
    console.error("[API] check-conflict error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
