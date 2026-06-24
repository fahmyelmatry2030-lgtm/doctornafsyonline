import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, Wallet, ArrowDownToLine, History } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { PLATFORM_PHONE } from "@/lib/constants";
import WithdrawalButton from "@/components/WithdrawalButton";

export default async function TherapistEarningsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const appointments = await prisma.appointment.findMany({
    where: { therapistId: session.user.id, status: "COMPLETED" },
    include: { patient: true },
    orderBy: { scheduledAt: "desc" },
  });

  const completedSessionsCount = appointments.length;
  const totalValue = appointments.reduce((sum, app) => sum + app.price, 0);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الجلسات والمستحقات المالية</h1>
        <p className="text-slate-600 mt-2 text-lg">نظرة تفصيلية على جلساتك المكتملة ونظام تسوية مستحقاتك.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-900/20 flex flex-col justify-between">
          <div>
            <h2 className="text-indigo-100 font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5" /> نظام الحساب المالي
            </h2>
            <p className="text-2xl font-black mt-4">راتب شهري ثابت</p>
          </div>
          <p className="text-xs text-indigo-200 mt-4 leading-relaxed">
            يتم احتساب وتحويل راتبك الشهري بشكل ثابت بالاتفاق مع الإدارة.
          </p>
        </div>

        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col justify-center">
          <h2 className="text-slate-500 font-semibold mb-2">عدد الجلسات المكتملة</h2>
          <p className="text-3xl font-black text-slate-800">{completedSessionsCount} <span className="text-lg text-slate-400">جلسة</span></p>
          <p className="text-xs text-slate-400 mt-2">خلال كامل فترة العمل بالمنصة</p>
        </div>

        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col justify-between bg-slate-50">
          <div>
            <h2 className="text-slate-700 font-bold mb-2 text-sm">تسوية المستحقات</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              تتم تسوية المستحقات والرواتب شهرياً بشكل مباشر عن طريق قسم الحسابات بالتنسيق مع إدارة المنصة.
            </p>
          </div>
          <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit mt-3">
            {PLATFORM_PHONE} للتواصل
          </span>
        </div>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">سجل الجلسات المكتملة</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المريض</th>
                <th className="px-6 py-4">قيمة الجلسة بالمنصة</th>
                <th className="px-6 py-4">حالة التأكيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">
                    {format(new Date(app.scheduledAt), 'dd MMMM yyyy', { locale: arSA })}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{app.patient.name}</td>
                  <td className="px-6 py-4 text-slate-600">{app.price} ج.م</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    مكتملة ومؤكدة ✓
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    لم تكمل أي جلسات بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
