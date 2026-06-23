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

    let commissions: any[] = [];
    let assignedShift = null;

    try {
      commissions = await prisma.commission.findMany({
        where: {
          shiftLeaderId: leaderId,
          appointment: {
            scheduledAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        },
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              therapistProfile: {
                select: { isAvailable: true },
              },
            },
          },
          appointment: {
            include: {
              patient: {
                select: { id: true, name: true, email: true, phone: true },
              },
              sessionStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbError: any) {
      // If Commission model doesn't exist, return empty team
      console.warn("[API] Commission query failed (model may not exist):", dbError.message);
      commissions = [];
    }

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

    let totalSessions = 0;
    let totalEarnings = 0;
    let totalCommissions = 0;

    for (const commission of commissions) {
      const specialist = commission.specialist;
      const appointment = commission.appointment;
      const specialistId = specialist.id;
      const isOnline = specialist.isOnline || specialist.therapistProfile?.isAvailable || false;

      if (!teamMap.has(specialistId)) {
        teamMap.set(specialistId, {
          specialistId,
          specialistName: specialist.name,
          isOnline,
          appointmentsToday: 0,
          totalEarnings: 0,
          commissionEarnings: 0,
          sessions: [],
        });
      }

      const teamMember = teamMap.get(specialistId)!;
      teamMember.appointmentsToday += 1;

      const sessionAmount = commission.sessionAmount || 0;
      totalEarnings += sessionAmount;
      totalCommissions += commission.shiftLeaderEarnings || 0;
      teamMember.totalEarnings += sessionAmount;
      teamMember.commissionEarnings += commission.shiftLeaderEarnings || 0;
      totalSessions += 1;

      teamMember.sessions.push({
        id: appointment.id,
        patientName: appointment.patient?.name || "غير معروف",
        patientEmail: appointment.patient?.email || "",
        patientPhone: appointment.patient?.phone || null,
        scheduledAt: appointment.scheduledAt.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        sessionStatus: appointment.sessionStatus?.status || "SCHEDULED",
        patientJoined: Boolean(appointment.sessionStatus?.patientJoinedAt),
        therapistJoined: Boolean(appointment.sessionStatus?.therapistJoinedAt),
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
