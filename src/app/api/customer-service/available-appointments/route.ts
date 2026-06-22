import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customer-service/available-appointments
 * 
 * الحصول على المواعيد المتاحة لأخصائي معين
 * 
 * Query params:
 * - therapistId: ID الأخصائي
 * - startDate: تاريخ البدء (ISO format)
 * - endDate: تاريخ النهاية (ISO format)
 * - duration: مدة الجلسة بالدقائق (اختياري، الافتراضي 50)
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

    // Check role: only ADMIN_CUSTOMER_SERVICE can access
    if (session.user.role !== "ADMIN_CUSTOMER_SERVICE" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied: ADMIN_CUSTOMER_SERVICE role required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get("therapistId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const duration = parseInt(searchParams.get("duration") || "50");

    // Validate required params
    if (!therapistId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required params: therapistId, startDate, endDate" },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Get all appointments for this therapist in the date range
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        therapistId,
        scheduledAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["CONFIRMED", "PENDING", "IN_PROGRESS"],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Get therapist's shifts
    const specialistShifts = await prisma.specialistShiftAssignment.findMany({
      where: {
        therapistId,
        isActive: true,
      },
      include: {
        shift: true,
      },
    });

    // Generate available slots
    const availableSlots = generateAvailableSlots(
      start,
      end,
      existingAppointments,
      specialistShifts,
      duration
    );

    return NextResponse.json({
      success: true,
      therapistId,
      dateRange: { start, end },
      duration,
      availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("[API] available-appointments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate available time slots based on existing appointments and shift times
 */
function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  existingAppointments: any[],
  shifts: any[],
  duration: number
): any[] {
  const slots = [];
  const current = new Date(startDate);

  // Get shift times for this period
  const shiftsByDay = new Map();
  shifts.forEach((shift) => {
    if (!shiftsByDay.has(shift.shift.dayOfWeek)) {
      shiftsByDay.set(shift.shift.dayOfWeek, []);
    }
    shiftsByDay.get(shift.shift.dayOfWeek).push({
      startTime: shift.shift.startTime,
      endTime: shift.shift.endTime,
    });
  });

  // Generate time slots for each day
  while (current <= endDate) {
    const dayName = getDayName(current.getDay());
    const dayShifts = shiftsByDay.get(dayName);

    if (dayShifts && dayShifts.length > 0) {
      // Process each shift for this day
      for (const shift of dayShifts) {
        const [shiftHour, shiftMin] = shift.startTime.split(":");
        const shiftStart = new Date(current);
        shiftStart.setHours(parseInt(shiftHour), parseInt(shiftMin), 0, 0);

        const [endHour, endMin] = shift.endTime.split(":");
        let shiftEnd = new Date(current);
        shiftEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

        // Handle overnight shifts (e.g., 8pm to 12am)
        if (shiftEnd <= shiftStart) {
          shiftEnd.setDate(shiftEnd.getDate() + 1);
        }

        // Generate slots for this shift
        let slotStart = new Date(shiftStart);
        while (slotStart.getTime() + duration * 60000 <= shiftEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          // Check if this slot conflicts with existing appointments
          const isConflict = existingAppointments.some((appt) => {
            const apptStart = new Date(appt.scheduledAt);
            const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);
            return slotStart < apptEnd && slotEnd > apptStart;
          });

          if (!isConflict && slotStart >= startDate && slotEnd <= endDate) {
            slots.push({
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              duration,
              available: true,
            });
          }

          slotStart = slotEnd;
        }
      }
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return slots;
}

function getDayName(dayIndex: number): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[dayIndex];
}
