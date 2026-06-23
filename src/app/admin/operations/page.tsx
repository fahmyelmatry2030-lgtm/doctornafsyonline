import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/admin/settings/actions";
import { OperationsTabs } from "@/components/OperationsTabs";
import { redirect } from "next/navigation";

export default async function AdminOperationsPage() {
  const session = await auth();
  const role = session?.user?.role;
  
  if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) {
    redirect("/admin/dashboard");
  }
  const isReadOnly = role === "ADMIN_VIEWER";

  const [appointments, settings] = await Promise.all([
    prisma.appointment.findMany({
      include: {
        patient: { select: { name: true, email: true } },
        therapist: { select: { name: true } },
        sessionNote: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getSettings(),
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">الحجوزات، الجلسات والمدفوعات</h1>
          <p className="text-slate-500 mt-1">
            إدارة متكاملة لجميع عمليات الحجوزات الطبية، غرف الجلسات المباشرة، وحساب الأرباح والمدفوعات
          </p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
            🔍 عرض فقط — لا يمكن التعديل
          </div>
        )}
      </div>

      <OperationsTabs
        initialAppointments={appointments as any}
        commissionRate={settings.commission}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
