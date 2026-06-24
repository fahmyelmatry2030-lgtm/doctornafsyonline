import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        baseSalary: true,
        therapistProfile: {
          select: {
            salary: true
          }
        },
        employeeBonuses: {
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // If user is a therapist, use therapistProfile.salary as baseSalary
    if (user.role === "THERAPIST" && user.therapistProfile) {
      user.baseSalary = user.therapistProfile.salary || 0;
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("[My Salary API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
