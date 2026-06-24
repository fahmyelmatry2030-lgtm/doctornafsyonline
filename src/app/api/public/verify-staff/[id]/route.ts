import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    let staffId = params.id;
    if (params && typeof params.then === "function") {
      const resolved = await params;
      staffId = resolved.id;
    }

    const employee = await prisma.user.findFirst({
      where: {
        id: staffId,
        role: {
          in: ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", "SHIFT_LEADER", "ADMIN_CUSTOMER_SERVICE", "ADMIN_MARKETING", "THERAPIST"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        therapistProfile: {
          select: {
            isVerified: true,
            specializations: true,
            bio: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
