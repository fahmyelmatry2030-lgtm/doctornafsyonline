import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = session.user.id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        baseSalary: true,
        role: true,
        therapistProfile: {
          select: { salary: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const baseSalary = user.role === "THERAPIST" || user.role === "SPECIALIST" 
      ? (user.therapistProfile?.salary || 0)
      : user.baseSalary;

    // Fetch current month's bonuses/deductions
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const bonuses = await prisma.employeeBonus.findMany({
      where: {
        userId,
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    // Also get therapists commissions if applicable
    let therapistCommissions = 0;
    if (user.role === "THERAPIST" || user.role === "SPECIALIST" || user.role === "SHIFT_LEADER") {
      const commissions = await prisma.commission.findMany({
        where: {
          OR: [
            { specialistId: userId },
            { shiftLeaderId: userId }
          ],
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      });
      
      commissions.forEach(c => {
        if (c.specialistId === userId) {
          therapistCommissions += c.specialistEarnings;
        } else if (c.shiftLeaderId === userId) {
          therapistCommissions += c.shiftLeaderEarnings;
        }
      });
    }

    let totalBonuses = therapistCommissions;
    let totalDeductions = 0;

    bonuses.forEach(b => {
      if (b.amount >= 0) totalBonuses += b.amount;
      else totalDeductions += Math.abs(b.amount);
    });

    // Fetch finalized records
    const history = await prisma.monthlySalaryRecord.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      current: {
        month: currentMonth,
        year: currentYear,
        baseSalary,
        totalBonuses,
        totalDeductions,
        netSalary: baseSalary + totalBonuses - totalDeductions,
      },
      history
    });

  } catch (error: any) {
    console.error("My Salary API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب البيانات" }, { status: 500 });
  }
}
