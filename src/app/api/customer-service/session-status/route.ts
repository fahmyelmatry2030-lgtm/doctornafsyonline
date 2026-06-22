import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customer-service/session-status?appointmentId=xxx
 * 
 * الحصول على حالة الجلسة
 * 
 * Query params:
 * - appointmentId: معرف الجلسة
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
    const allowedRoles = ["ADMIN", "ADMIN_CUSTOMER_SERVICE"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    // Get appointment with session status
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        therapist: { select: { id: true, name: true, email: true } },
        sessionStatus: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // If no session status exists, create one
    let sessionStatus = appointment.sessionStatus;
    if (!sessionStatus) {
      sessionStatus = await prisma.sessionStatus.create({
        data: {
          appointmentId,
          status: "SCHEDULED",
        },
      });
    }

    // Calculate time differences for monitoring
    const now = new Date();
    const scheduledTime = new Date(appointment.scheduledAt);
    const appointmentEnd = new Date(
      scheduledTime.getTime() + appointment.duration * 60000
    );

    const minutesUntilStart = Math.round(
      (scheduledTime.getTime() - now.getTime()) / 60000
    );
    const isLate = minutesUntilStart < 0;
    const minutesLate = Math.abs(minutesUntilStart);

    // Determine current phase
    let phase = "pending";
    if (sessionStatus.status === "IN_PROGRESS") {
      phase = "in-progress";
    } else if (sessionStatus.status === "COMPLETED") {
      phase = "completed";
    } else if (sessionStatus.status === "CANCELLED") {
      phase = "cancelled";
    } else if (isLate && !sessionStatus.sessionStartedAt) {
      phase = "late";
    } else if (now >= scheduledTime && now < appointmentEnd) {
      phase = "should-be-live";
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        patientName: appointment.patient.name,
        therapistName: appointment.therapist.name,
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration,
        status: appointment.status,
      },
      sessionStatus: {
        status: sessionStatus.status,
        patientJoinedAt: sessionStatus.patientJoinedAt,
        therapistJoinedAt: sessionStatus.therapistJoinedAt,
        sessionStartedAt: sessionStatus.sessionStartedAt,
        sessionEndedAt: sessionStatus.sessionEndedAt,
      },
      monitoring: {
        phase,
        isScheduled: !isLate,
        isLate,
        minutesLate: isLate ? minutesLate : 0,
        minutesUntilStart: !isLate ? minutesUntilStart : 0,
        patientJoined: !!sessionStatus.patientJoinedAt,
        therapistJoined: !!sessionStatus.therapistJoinedAt,
        sessionActive: sessionStatus.status === "IN_PROGRESS",
        sessionCompleted: sessionStatus.status === "COMPLETED",
      },
      actions: {
        canMarkAsStarted: sessionStatus.status === "SCHEDULED" || sessionStatus.status === "PATIENT_JOINED" || sessionStatus.status === "THERAPIST_JOINED",
        canMarkAsEnded: sessionStatus.status === "IN_PROGRESS",
        canCancel: !["COMPLETED", "CANCELLED"].includes(sessionStatus.status),
      },
    });
  } catch (error) {
    console.error("[API] session-status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customer-service/session-status
 * 
 * تحديث حالة الجلسة
 */
export async function PUT(req: NextRequest) {
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
    const allowedRoles = ["ADMIN", "ADMIN_CUSTOMER_SERVICE"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { appointmentId, action } = body;

    if (!appointmentId || !action) {
      return NextResponse.json(
        { error: "Missing appointmentId or action" },
        { status: 400 }
      );
    }

    // Valid actions: mark-patient-joined, mark-therapist-joined, mark-started, mark-ended, cancel
    const validActions = [
      "mark-patient-joined",
      "mark-therapist-joined",
      "mark-started",
      "mark-ended",
      "cancel",
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Valid actions: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // Get current session status
    let sessionStatus = await prisma.sessionStatus.findUnique({
      where: { appointmentId },
    });

    if (!sessionStatus) {
      sessionStatus = await prisma.sessionStatus.create({
        data: { appointmentId },
      });
    }

    // Update based on action
    let updatedStatus = sessionStatus;
    const now = new Date();

    switch (action) {
      case "mark-patient-joined":
        updatedStatus = await prisma.sessionStatus.update({
          where: { id: sessionStatus.id },
          data: {
            status: "PATIENT_JOINED",
            patientJoinedAt: now,
          },
        });
        break;

      case "mark-therapist-joined":
        updatedStatus = await prisma.sessionStatus.update({
          where: { id: sessionStatus.id },
          data: {
            status: "THERAPIST_JOINED",
            therapistJoinedAt: now,
          },
        });
        break;

      case "mark-started":
        updatedStatus = await prisma.sessionStatus.update({
          where: { id: sessionStatus.id },
          data: {
            status: "IN_PROGRESS",
            sessionStartedAt: now,
          },
        });
        break;

      case "mark-ended":
        updatedStatus = await prisma.sessionStatus.update({
          where: { id: sessionStatus.id },
          data: {
            status: "COMPLETED",
            sessionEndedAt: now,
          },
        });
        break;

      case "cancel":
        updatedStatus = await prisma.sessionStatus.update({
          where: { id: sessionStatus.id },
          data: {
            status: "CANCELLED",
          },
        });
        break;
    }

    return NextResponse.json({
      success: true,
      message: `✅ تم ${getActionArabicName(action)} بنجاح`,
      sessionStatus: updatedStatus,
    });
  } catch (error) {
    console.error("[API] session-status PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getActionArabicName(action: string): string {
  const names: { [key: string]: string } = {
    "mark-patient-joined": "تسجيل دخول المريض",
    "mark-therapist-joined": "تسجيل دخول الأخصائي",
    "mark-started": "بدء الجلسة",
    "mark-ended": "إنهاء الجلسة",
    cancel: "إلغاء الجلسة",
  };
  return names[action] || action;
}
