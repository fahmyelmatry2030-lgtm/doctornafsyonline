import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "ADMIN_HR" &&
      session.user.role !== "ADMIN_VIEWER")
  ) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  // Fetch all admin/manager staff
  const adminStaff = await prisma.user.findMany({
    where: {
      role: {
        in: [
          "ADMIN",
          "ADMIN_HR",
          "ADMIN_ACCOUNTING",
          "ADMIN_VIEWER",
          "SHIFT_LEADER",
          "ADMIN_CUSTOMER_SERVICE",
          "ADMIN_MARKETING",
        ],
      },
      isSuspended: false,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all verified therapists
  const therapists = await prisma.user.findMany({
    where: {
      role: "THERAPIST",
      isSuspended: false,
      therapistProfile: { isVerified: true },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      therapistProfile: {
        select: {
          specializations: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const adminMapped = adminStaff.map((u) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    jobTitle: getRoleLabel(u.role),
    isVerified: true,
    specializations: null,
  }));

  const therapistsMapped = therapists.map((u) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    jobTitle: u.therapistProfile?.specializations || "أخصائي نفسي إكلينيكي",
    isVerified: u.therapistProfile?.isVerified ?? false,
    specializations: u.therapistProfile?.specializations || null,
  }));

  return NextResponse.json({
    staff: [...adminMapped, ...therapistsMapped],
    total: adminMapped.length + therapistsMapped.length,
  });
}

function getRoleLabel(role: string) {
  if (role === "ADMIN") return "مدير عام النظام";
  if (role === "ADMIN_HR") return "إدارة الموارد البشرية";
  if (role === "ADMIN_ACCOUNTING") return "الإدارة المالية";
  if (role === "ADMIN_VIEWER") return "مراقب لوحة التحكم";
  if (role === "SHIFT_LEADER") return "قائد الشيفت";
  if (role === "ADMIN_CUSTOMER_SERVICE") return "خدمة العملاء";
  if (role === "ADMIN_MARKETING") return "المبيعات والتسويق";
  return "عضو فريق العمل";
}
