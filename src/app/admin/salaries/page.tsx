import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SalariesClientTable } from "@/components/SalariesClientTable";

export default async function AdminSalariesPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) {
    redirect("/dashboard");
  }

  const isReadOnly = role === "ADMIN_VIEWER";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch therapists with their profiles and completed sessions count for the current month
  const dbTherapists = await prisma.user.findMany({
    where: { role: "THERAPIST" },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      therapistProfile: {
        select: {
          pricePerSession: true,
          salary: true,
          salaryType: true,
        },
      },
      therapistAppointments: {
        where: {
          status: "COMPLETED",
          scheduledAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedTherapists = dbTherapists.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    completedSessionsCount: t.therapistAppointments.length,
    therapistProfile: t.therapistProfile,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة مرتبات الأخصائيين</h1>
        <p className="text-slate-500 mt-2">
          إدارة وتعديل رواتب الأخصائيين المحددة شهرياً ومتابعة إحصائيات الدفع للشهر الحالي
        </p>
      </div>

      <SalariesClientTable initialTherapists={formattedTherapists} isReadOnly={isReadOnly} />
    </div>
  );
}
