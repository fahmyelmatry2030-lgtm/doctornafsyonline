import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customer-service/specialists-sessions
 * 
 * الحصول على جميع الجلسات للأخصائيين في فترة معينة
 * 
 * Query params:
 * - shiftId: معرف الفترة (اختياري)
 * - startDate: تاريخ البدء (ISO format)
 * - endDate: تاريخ النهاية (ISO format)
 */
export async function GET(req: NextRequest) {
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
    if (session.user.role !== "ADMIN_CUSTOMER_SERVICE" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const shiftId = searchParams.get("shiftId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required params: startDate, endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get specialists for this shift (or all if no shiftId)
    let specialistIds: string[] = [];

    if (shiftId) {
      const shiftAssignments = await prisma.specialistShiftAssignment.findMany({
        where: {
          shiftId,
          isActive: true,
        },
        select: { therapistId: true },
      });
      specialistIds = shiftAssignments.map((a) => a.therapistId);
    } else {
      // Get all active specialists
      const therapists = await prisma.user.findMany({
        where: { role: "THERAPIST" },
        select: { id: true },
      });
      specialistIds = therapists.map((t) => t.id);
    }

    // Get appointments for these specialists in the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId: { in: specialistIds },
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        therapist: { select: { id: true, name: true, email: true } },
        sessionStatus: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Group by therapist
    const appointmentsByTherapist = new Map();

    for (const appt of appointments) {
      if (!appointmentsByTherapist.has(appt.therapistId)) {
        appointmentsByTherapist.set(appt.therapistId, {
          therapistId: appt.therapistId,
          therapistName: appt.therapist.name,
          appointments: [],
        });
      }

      appointmentsByTherapist.get(appt.therapistId).appointments.push({
        id: appt.id,
        patientName: appt.patient.name,
        patientEmail: appt.patient.email,
        scheduledAt: appt.scheduledAt,
        duration: appt.duration,
        status: appt.status,
        sessionStatus: appt.sessionStatus?.status || "SCHEDULED",
        sessionStartedAt: appt.sessionStatus?.sessionStartedAt,
        sessionEndedAt: appt.sessionStatus?.sessionEndedAt,
        patientJoined: !!appt.sessionStatus?.patientJoinedAt,
        therapistJoined: !!appt.sessionStatus?.therapistJoinedAt,
      });
    }

    const result = Array.from(appointmentsByTherapist.values());

    return NextResponse.json({
      success: true,
      dateRange: { start, end },
      specialistsCount: specialistIds.length,
      appointmentsCount: appointments.length,
      specialists: result,
    });
  } catch (error) {
    console.error("[API] specialists-sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
