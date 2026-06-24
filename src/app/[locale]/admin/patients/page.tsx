import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientsTableClient } from "./PatientsTableClient";

export default async function AdminPatientsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_HR" && role !== "ADMIN_VIEWER")) return null;
  const isReadOnly = role === "ADMIN_VIEWER";

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
    if (!s?.user || (s.user.role !== "ADMIN" && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");
    
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
  }

  async function deletePatient(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || (s.user.role !== "ADMIN" && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { patientId: userId } }),
      prisma.review.deleteMany({ where: { patientId: userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الملفات الطبية والحالات 👥</h1>
          <p className="text-slate-500 mt-1">البحث برقم كود الحالة الفريد والاطلاع على سجلات وتقارير الأخصائيين بالتفصيل</p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
            🔍 عرض فقط — لا يمكن التعديل
          </div>
        )}
      </div>

      <PatientsTableClient
        initialPatients={patients as any}
        toggleSuspend={toggleSuspend}
        deletePatient={deletePatient}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
