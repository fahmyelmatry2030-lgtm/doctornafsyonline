import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SHIFT_LEADER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const leaderId = session.user.id;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    let assignedShift = null;
    try {
      assignedShift = await prisma.shift.findFirst({
        where: { shiftLeaderId: leaderId },
        select: {
          id: true,
          name: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          description: true,
          isActive: true,
        },
      });
    } catch (dbError: any) {
      console.warn("[API] Shift query failed:", dbError.message);
      assignedShift = null;
    }

    const teamMap = new Map<string, {
      specialistId: string;
      specialistName: string;
      isOnline: boolean;
      appointmentsToday: number;
      totalEarnings: number;
      commissionEarnings: number;
      sessions: Array<{
        id: string;
        patientName: string;
        patientEmail: string;
        patientPhone?: string | null;
        scheduledAt: string;
        duration: number;
        status: string;
        sessionStatus: string;
        patientJoined: boolean;
        therapistJoined: boolean;
        amount: number;
      }>;
    }>();

    // 1. Get all specialists assigned to this shift (or all active specialists if no shift is assigned yet)
    let specialists: any[] = [];
    try {
      if (assignedShift) {
        const assignments = await prisma.specialistShiftAssignment.findMany({
          where: { shiftId: assignedShift.id, isActive: true },
          include: {
            therapist: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                therapistProfile: {
                  select: { isAvailable: true, pricePerSession: true }
                }
              }
            }
          }
        });
        specialists = assignments.map(a => a.therapist);
      }
      
      // Fallback: if no shift is assigned, or the shift has 0 active specialist assignments
      if (specialists.length === 0) {
        specialists = await prisma.user.findMany({
          where: { role: "THERAPIST", isSuspended: false },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isOnline: true,
            therapistProfile: {
              select: { isAvailable: true, pricePerSession: true }
            }
          }
        });
      }
    } catch (dbError: any) {
      console.warn("[API] Failed to fetch specialists:", dbError.message);
    }

    // Initialize map
    for (const spec of specialists) {
      teamMap.set(spec.id, {
        specialistId: spec.id,
        specialistName: spec.name,
        isOnline: spec.isOnline === true,
        appointmentsToday: 0,
        totalEarnings: 0,
        commissionEarnings: 0,
        sessions: [],
      });
    }

    // 2. Fetch today's appointments for these specialists
    const specialistIds = Array.from(teamMap.keys());
    let appointments: any[] = [];
    if (specialistIds.length > 0) {
      try {
        appointments = await prisma.appointment.findMany({
          where: {
            therapistId: { in: specialistIds },
            scheduledAt: {
              gte: startOfToday,
              lte: endOfToday,
            }
          },
          include: {
            patient: { select: { id: true, name: true, email: true, phone: true } },
            sessionStatus: true,
            commissions: {
              where: { shiftLeaderId: leaderId }
            }
          }
        });
      } catch (dbError: any) {
        console.warn("[API] Failed to fetch appointments:", dbError.message);
      }
    }

    let totalSessions = 0;
    let totalEarnings = 0;
    let totalCommissions = 0;

    for (const appt of appointments) {
      const teamMember = teamMap.get(appt.therapistId);
      if (!teamMember) continue;

      teamMember.appointmentsToday += 1;
      
      // Calculate earnings (if commission record exists, use it; otherwise fallback)
      const commission = appt.commissions?.[0];
      const sessionAmount = commission?.sessionAmount ?? appt.price;
      const shiftLeaderEarnings = commission?.shiftLeaderEarnings ?? Math.round(appt.price * 0.1); // fallback 10%

      totalEarnings += sessionAmount;
      totalCommissions += shiftLeaderEarnings;
      teamMember.totalEarnings += sessionAmount;
      teamMember.commissionEarnings += shiftLeaderEarnings;
      totalSessions += 1;

      teamMember.sessions.push({
        id: appt.id,
        patientName: appt.patient?.name || "غير معروف",
        patientEmail: appt.patient?.email || "",
        patientPhone: appt.patient?.phone || null,
        scheduledAt: appt.scheduledAt.toISOString(),
        duration: appt.duration,
        status: appt.status,
        sessionStatus: appt.sessionStatus?.status || "SCHEDULED",
        patientJoined: Boolean(appt.sessionStatus?.patientJoinedAt),
        therapistJoined: Boolean(appt.sessionStatus?.therapistJoinedAt),
        amount: sessionAmount,
      });
    }

    const team = Array.from(teamMap.values());
    const onlineSpecialists = team.filter((member) => member.isOnline).length;

    return NextResponse.json({
      success: true,
      assignedShift,
      totalSpecialists: team.length,
      onlineSpecialists,
      totalSessions,
      totalEarnings,
      totalCommissions,
      team,
    });
  } catch (error) {
    console.error("[API] admin/shift-leader GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
