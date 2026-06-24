import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TherapistsTableClient } from "./TherapistsTableClient";
import Link from "next/link";
import { Settings } from "lucide-react";

export default async function AdminTherapistsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_HR" && role !== "ADMIN_VIEWER")) return null;
  const isReadOnly = role === "ADMIN_VIEWER";

  const therapists = await prisma.user.findMany({
    where: { role: "THERAPIST" },
    include: {
      therapistProfile: true,
      _count: { select: { therapistAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  async function toggleVerification(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || (!s.user.role?.startsWith("ADMIN") && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");

    await prisma.therapistProfile.update({
      where: { userId },
      data: { isVerified: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function updateCertificateStatus(userId: string, certId: string, status: "APPROVED" | "REJECTED") {
    "use server";
    const s = await auth();
    if (!s?.user || (!s.user.role?.startsWith("ADMIN") && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      select: { certificates: true }
    });
    if (!profile) return;
    const certs = profile.certificates ? JSON.parse(profile.certificates) : [];
    const updated = certs.map((c: any) => c.id === certId ? { ...c, status } : c);
    
    await prisma.therapistProfile.update({
      where: { userId },
      data: { certificates: JSON.stringify(updated) }
    });
    revalidatePath("/admin/therapists");
  }

  async function toggleSuspend(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || (!s.user.role?.startsWith("ADMIN") && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function deleteTherapist(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || (!s.user.role?.startsWith("ADMIN") && s.user.role !== "ADMIN_HR")) throw new Error("غير مصرح لك");

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { therapistId: userId } }),
      prisma.sessionNote.deleteMany({ where: { therapistId: userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.therapistProfile.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    revalidatePath("/admin/therapists");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الأخصائيين</h1>
          <p className="text-slate-500 mt-1">مراجعة وتوثيق حسابات الأخصائيين وإدارة ملفاتهم المهنية وعقودهم</p>
        </div>
        <div className="flex items-center gap-3">
          {role === "ADMIN" && (
            <Link
              href="/admin/settings?tab=contracts"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all text-xs font-bold shadow-sm"
            >
              <Settings className="w-4 h-4" /> تعديل نماذج العقود الرسمية
            </Link>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
              🔍 عرض فقط — لا يمكن التعديل
            </div>
          )}
        </div>
      </div>

      <TherapistsTableClient
        initialTherapists={therapists as any}
        toggleVerification={toggleVerification}
        updateCertificateStatus={updateCertificateStatus}
        toggleSuspend={toggleSuspend}
        deleteTherapist={deleteTherapist}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
