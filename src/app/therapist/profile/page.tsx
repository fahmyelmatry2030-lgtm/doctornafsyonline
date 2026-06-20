import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CertificatesManager from "@/components/CertificatesManager";
import ContractManager from "@/components/ContractManager";
import { getSettings } from "@/app/admin/settings/actions";
import AvatarManager from "@/components/AvatarManager";
import TherapistProfileForm from "./TherapistProfileForm";

export default async function TherapistProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!profile) return null;
  const settings = await getSettings();

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الملف الشخصي والمهني</h1>
        <p className="text-slate-600 mt-2 text-lg">تحديث النبذة، الأسعار، والتخصصات الخاصة بك.</p>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 space-y-8">
        <AvatarManager initialAvatar={profile.user.avatar} name={profile.user.name} />

        <TherapistProfileForm profile={profile as any} settings={settings} />

        <CertificatesManager />
        <ContractManager />
      </div>
    </div>
  );
}
