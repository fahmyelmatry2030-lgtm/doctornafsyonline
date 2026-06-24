import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import SettingsForm from "@/components/SettingsForm";

export default async function TherapistSettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  async function updatePassword(formData: FormData) {
    "use server";
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "غير مصرح" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return { success: false, error: "كلمة المرور الحالية غير صحيحة" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الإعدادات</h1>
        <p className="text-slate-600 mt-2 text-lg">إدارة إعدادات حسابك الأمني والإشعارات.</p>
      </div>

      <SettingsForm updatePasswordAction={updatePassword} />
    </div>
  );
}
