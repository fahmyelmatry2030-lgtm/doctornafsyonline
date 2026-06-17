import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TherapistsTableClient } from "./TherapistsTableClient";

export default async function AdminTherapistsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

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
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.therapistProfile.update({
      where: { userId },
      data: { isVerified: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function updateCertificateStatus(userId: string, certId: string, status: "APPROVED" | "REJECTED") {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

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
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function deleteTherapist(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/therapists");
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الأخصائيين</h1>
          <p className="text-slate-500 mt-1">مراجعة وتوثيق حسابات الأخصائيين وإدارة ملفاتهم المهنية وعقودهم</p>
        </div>
      </div>

      <TherapistsTableClient
        initialTherapists={therapists as any}
        toggleVerification={toggleVerification}
        updateCertificateStatus={updateCertificateStatus}
        toggleSuspend={toggleSuspend}
        deleteTherapist={deleteTherapist}
      />
    </div>
  );
}
