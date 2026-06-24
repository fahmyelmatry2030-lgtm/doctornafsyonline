import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import AvatarManager from "@/components/AvatarManager";

export default async function AdminProfilePage() {
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
    let phone = formData.get("phone") as string;
    const gender = formData.get("gender") as string;
    
    if (phone) {
      phone = phone.replace(/\D/g, "").slice(0, 11);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { name, phone, gender },
    });
    
    revalidatePath("/admin/profile");
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الملف الشخصي</h1>
        <p className="text-slate-600 mt-2 text-lg">تحديث بياناتك الشخصية وصورة الحساب</p>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8">
        <AvatarManager initialAvatar={user.avatar} name={user.name} />

        <div className="mt-8 border-t border-slate-100 pt-8">
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الاسم كامل</label>
              <input
                type="text"
                name="name"
                defaultValue={user.name || ""}
                className="w-full rounded-2xl border-0 bg-slate-50/50 p-4 shadow-inner ring-1 ring-inset ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                defaultValue={user.phone || ""}
                className="w-full rounded-2xl border-0 bg-slate-50/50 p-4 shadow-inner ring-1 ring-inset ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-600"
                required
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">النوع</label>
              <select
                name="gender"
                defaultValue={user.gender || ""}
                className="w-full rounded-2xl border-0 bg-slate-50/50 p-4 shadow-inner ring-1 ring-inset ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">غير محدد</option>
                <option value="MALE">ذكر</option>
                <option value="FEMALE">أنثى</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-premium transition-all hover:-translate-y-1 hover:shadow-premium-hover active:translate-y-0"
            >
              حفظ التعديلات
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
