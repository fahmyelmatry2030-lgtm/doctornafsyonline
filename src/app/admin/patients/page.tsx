import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientsTableClient } from "./PatientsTableClient";

export default async function AdminPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  // Retrieve patients with full appointment details and session notes
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: {
      patientAppointments: {
        include: {
          therapist: {
            select: {
              name: true,
              email: true,
            },
          },
          sessionNote: {
            select: {
              notes: true,
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  async function toggleSuspend(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");
    
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
  }

  async function deletePatient(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.delete({ where: { id: userId } });
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الملفات الطبية والحالات 👥</h1>
          <p className="text-slate-500 mt-1">البحث برقم كود الحالة الفريد والاطلاع على سجلات وتقارير الأخصائيين بالتفصيل</p>
        </div>
      </div>

      <PatientsTableClient
        initialPatients={patients as any}
        toggleSuspend={toggleSuspend}
        deletePatient={deletePatient}
      />
    </div>
  );
}
