import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const output: any = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // 1️⃣ Check Auth
    output.checks.auth = { status: "checking" };
    try {
      const session = await auth();
      output.checks.auth = {
        status: "success",
        hasSession: !!session,
        userId: session?.user?.id || null,
        userRole: session?.user?.role || null,
        userName: session?.user?.name || null,
      };
    } catch (e: any) {
      output.checks.auth = {
        status: "error",
        error: e.message,
      };
    }

    // 2️⃣ Check Database Connection
    output.checks.database = { status: "checking" };
    try {
      const dbTest = await prisma.user.findFirst({
        select: { id: true },
        take: 1,
      });
      output.checks.database = {
        status: "success",
        message: "Database connected",
        hasUsers: !!dbTest,
      };
    } catch (e: any) {
      output.checks.database = {
        status: "error",
        error: e.message,
      };
    }

    // 3️⃣ Check Commission Model
    output.checks.commission = { status: "checking" };
    try {
      const commissionCount = await prisma.commission.count();
      output.checks.commission = {
        status: "success",
        totalCommissions: commissionCount,
      };
    } catch (e: any) {
      output.checks.commission = {
        status: "error",
        error: e.message,
      };
    }

    // 4️⃣ Check Shift Leaders Count
    output.checks.shiftLeaders = { status: "checking" };
    try {
      const shiftLeaders = await prisma.user.count({
        where: { role: "SHIFT_LEADER" },
      });
      output.checks.shiftLeaders = {
        status: "success",
        count: shiftLeaders,
      };
    } catch (e: any) {
      output.checks.shiftLeaders = {
        status: "error",
        error: e.message,
      };
    }

    // 5️⃣ Check Specialists Count
    output.checks.specialists = { status: "checking" };
    try {
      const specialists = await prisma.user.count({
        where: { role: "THERAPIST" },
      });
      output.checks.specialists = {
        status: "success",
        count: specialists,
      };
    } catch (e: any) {
      output.checks.specialists = {
        status: "error",
        error: e.message,
      };
    }

    // 6️⃣ Check if Current User is Shift Leader
    output.checks.authorization = { status: "checking" };
    try {
      const session = await auth();
      if (!session?.user) {
        output.checks.authorization = {
          status: "error",
          error: "No authenticated user",
        };
      } else {
        const isShiftLeader = session.user.role === "SHIFT_LEADER" || session.user.role === "ADMIN";
        output.checks.authorization = {
          status: "success",
          isAuthorized: isShiftLeader,
          userRole: session.user.role,
        };
      }
    } catch (e: any) {
      output.checks.authorization = {
        status: "error",
        error: e.message,
      };
    }

    return NextResponse.json(output);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
