import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    
    if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", "SHIFT_LEADER", "ADMIN_CUSTOMER_SERVICE", "ADMIN_MARKETING"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        baseSalary: true,
        employeeBonuses: {
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        },
        monthlySalaryRecords: {
          where: {
            month: now.getMonth() + 1,
            year: now.getFullYear()
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("[Employee Salaries GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId, amount, reason } = body;

    if (action === "UPDATE_BASE_SALARY") {
      await prisma.user.update({
        where: { id: userId },
        data: { baseSalary: amount }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "ADD_BONUS") {
      await prisma.employeeBonus.create({
        data: {
          userId,
          amount,
          reason: reason || "بدون سبب"
        }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "DELETE_BONUS") {
      const { bonusId } = body;
      await prisma.employeeBonus.delete({
        where: { id: bonusId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("[Employee Salaries POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
