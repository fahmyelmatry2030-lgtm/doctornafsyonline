import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import CertificatesManager from "@/components/CertificatesManager";
import { getSettings } from "@/app/admin/settings/actions";

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

  async function updateProfile(formData: FormData) {
    "use server";
    const bio = formData.get("bio") as string;
    const specializations = formData.get("specializations") as string;
    let pricePerSession = parseInt(formData.get("pricePerSession") as string);
    const yearsExperience = parseInt(formData.get("yearsExperience") as string);
    const isAvailable = formData.get("isAvailable") === "on";

    const currentSettings = await getSettings();
    if (pricePerSession < currentSettings.minPrice) pricePerSession = currentSettings.minPrice;
    if (pricePerSession > currentSettings.maxPrice) pricePerSession = currentSettings.maxPrice;

    await prisma.therapistProfile.update({
      where: { userId },
      data: { 
        bio, 
        specializations, 
        pricePerSession, 
        yearsExperience,
        isAvailable 
      },
    });
    
    revalidatePath("/therapist/profile");
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الملف الشخصي والمهني</h1>
        <p className="text-slate-600 mt-2 text-lg">تحديث النبذة، الأسعار، والتخصصات الخاصة بك.</p>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 space-y-8">
        <form action={updateProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">الاسم (للعرض فقط)</label>
              <input type="text" defaultValue={profile.user.name} disabled className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-3 px-4 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">سنوات الخبرة</label>
              <input type="number" name="yearsExperience" defaultValue={profile.yearsExperience} min="1" className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              سعر الجلسة (الحد الأدنى المسموح به: {settings.minPrice} ج.م · الحد الأقصى: {settings.maxPrice} ج.م)
            </label>
            <div className="relative">
              <input type="number" name="pricePerSession" defaultValue={profile.pricePerSession} min={settings.minPrice} max={settings.maxPrice} className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 pl-12 pr-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm" />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 font-semibold">
                ج.م
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">التخصصات (مفصولة بفاصلة)</label>
            <input type="text" name="specializations" defaultValue={profile.specializations} placeholder="مثال: القلق، الاكتئاب، العلاقات الزوجية" className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">نبذة تعريفية (Bio)</label>
            <textarea name="bio" rows={4} defaultValue={profile.bio} className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm resize-none"></textarea>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <input type="checkbox" id="isAvailable" name="isAvailable" defaultChecked={profile.isAvailable} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
            <label htmlFor="isAvailable" className="font-semibold text-indigo-900 cursor-pointer">
              متاح لاستقبال حجوزات جديدة
            </label>
          </div>

          <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30">
            حفظ التعديلات
          </button>
        </form>

        <CertificatesManager />
      </div>
    </div>
  );
}
