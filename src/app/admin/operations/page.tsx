import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/admin/settings/actions";
import { OperationsTabs } from "@/components/OperationsTabs";

export default async function AdminOperationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

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
      <div>
        <h1 className="text-3xl font-black text-slate-900">الحجوزات، الجلسات والمدفوعات</h1>
        <p className="text-slate-500 mt-1">
          إدارة متكاملة لجميع عمليات الحجوزات الطبية، غرف الجلسات المباشرة، وحساب الأرباح والمدفوعات
        </p>
      </div>

      <OperationsTabs
        initialAppointments={appointments as any}
        commissionRate={settings.commission}
      />
    </div>
  );
}
