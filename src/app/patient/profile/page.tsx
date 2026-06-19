import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import AvatarManager from "@/components/AvatarManager";

export default async function PatientProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const gender = formData.get("gender") as string;
    
    await prisma.user.update({
      where: { id: userId },
      data: { name, phone, gender },
    });
    
    revalidatePath("/patient/profile");
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الملف الشخصي</h1>
        <p className="text-slate-600 mt-2 text-lg">تحديث بياناتك الشخصية ومعلومات التواصل وصورتك الشخصية.</p>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8">
        <div className="mb-6 flex justify-center">
          <AvatarManager initialAvatar={user.avatar} name={user.name} />
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              name="name"
              defaultValue={user.name} 
              required
              className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني (لا يمكن تعديله)</label>
            <input 
              type="email" 
              defaultValue={user.email} 
              disabled
              className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-3.5 px-4 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">رقم الهاتف</label>
              <input 
                type="tel" 
                name="phone"
                defaultValue={user.phone || ""} 
                className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
                placeholder={`مثال: ${PLATFORM_PHONE}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">الجنس</label>
              <select
                name="gender"
                defaultValue={user.gender || ""}
                className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
              >
                <option value="" disabled>اختر الجنس</option>
                <option value="MALE">رجل</option>
                <option value="FEMALE">أنثى</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30"
          >
            حفظ التعديلات
          </button>
        </form>
      </div>
    </div>
  );
}
