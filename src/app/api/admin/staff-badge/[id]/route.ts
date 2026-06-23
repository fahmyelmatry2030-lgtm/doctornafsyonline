import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  // Must be an admin to view staff badges
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "ADMIN_HR" &&
      session.user.role !== "ADMIN_VIEWER")
  ) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const resolvedParams = await params;
  const staffId = resolvedParams.id;

  const user = await prisma.user.findFirst({
    where: {
      id: staffId,
      role: {
        in: [
          "THERAPIST",
          "ADMIN",
          "ADMIN_HR",
          "ADMIN_ACCOUNTING",
          "ADMIN_VIEWER",
          "SHIFT_LEADER",
          "ADMIN_CUSTOMER_SERVICE",
        ],
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      isSuspended: true,
      therapistProfile: {
        select: {
          isVerified: true,
          specializations: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "لم يتم العثور على الموظف" }, { status: 404 });
  }

  const isVerified =
    user.role === "THERAPIST"
      ? !user.isSuspended && user.therapistProfile?.isVerified === true
      : !user.isSuspended;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    specializations: user.therapistProfile?.specializations || null,
    isVerified,
  });
}
