import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlertCircle } from "lucide-react";
import { ShiftsManagementClient } from "@/components/ShiftsManagementClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ShiftLeaderPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Allowed roles to manage shifts
  const allowedRoles = ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER"];
  const isAuthorized = allowedRoles.includes(session.user.role);

  if (!isAuthorized) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 p-6">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-2">غير مصرح - صلاحيات غير كافية</h3>
            <p className="text-sm mb-3">
              حسابك الحالي: <strong>{session.user.email}</strong>
            </p>
            <p className="text-sm mb-3">
              الدور الحالي: <strong>{session.user.role}</strong>
            </p>
            <p className="text-sm mb-3">
              تحتاج صلاحية إدارة الشيفتات للدخول.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = session.user.role === "ADMIN_VIEWER";

  // Fetch all shifts
  const shifts = await prisma.shift.findMany({
    include: {
      shiftLeader: {
        select: { id: true, name: true, email: true }
      },
      specialistAssignments: {
        where: { isActive: true },
        include: {
          therapist: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch shift leaders
  const shiftLeaders = await prisma.user.findMany({
    where: {
      role: { in: ["SHIFT_LEADER", "ADMIN"] },
      isSuspended: false
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" }
  });

  // Fetch all specialists
  const specialists = await prisma.user.findMany({
    where: {
      role: "THERAPIST",
      isSuspended: false
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة فترات العمل والشيفتات</h1>
        <p className="text-slate-500 mt-2">
          إدارة وتعديل فترات العمل اليومية، وتعيين قادة الشيفتات لكل فترة وتوزيع الأخصائيين عليها.
        </p>
      </div>

      <ShiftsManagementClient
        initialShifts={shifts}
        shiftLeaders={shiftLeaders}
        specialists={specialists}
        isReadOnly={isReadOnly}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
