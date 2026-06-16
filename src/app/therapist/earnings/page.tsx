import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, Wallet, ArrowDownToLine, History } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import WithdrawalButton from "@/components/WithdrawalButton";

export default async function TherapistEarningsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const appointments = await prisma.appointment.findMany({
    where: { therapistId: session.user.id, status: "COMPLETED" },
    include: { patient: true },
    orderBy: { scheduledAt: "desc" },
  });

  const totalEarnings = appointments.reduce((sum, app) => sum + app.price, 0);
  const platformCut = totalEarnings * 0.20; // 20% cut for platform
  const netEarnings = totalEarnings - platformCut;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الأرباح والمحفظة</h1>
        <p className="text-slate-600 mt-2 text-lg">نظرة تفصيلية على أرباحك وعمليات السحب.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-900/20">
          <h2 className="text-indigo-100 font-semibold mb-2 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> الرصيد المتاح للسحب
          </h2>
          <p className="text-4xl font-black mt-4">{netEarnings} <span className="text-xl text-indigo-200">ج.م</span></p>
          <WithdrawalButton maxAmount={netEarnings} />
        </div>

        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col justify-center">
          <h2 className="text-slate-500 font-semibold mb-2">إجمالي الدخل (قبل العمولة)</h2>
          <p className="text-3xl font-black text-slate-800">{totalEarnings} <span className="text-lg text-slate-400">ج.م</span></p>
        </div>

        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col justify-center">
          <h2 className="text-slate-500 font-semibold mb-2">عمولة المنصة (20%)</h2>
          <p className="text-3xl font-black text-red-500">{platformCut} <span className="text-lg text-red-300">ج.م</span></p>
        </div>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">سجل الجلسات المدفوعة</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المريض</th>
                <th className="px-6 py-4">سعر الجلسة</th>
                <th className="px-6 py-4">الصافي</th>
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
                  <td className="px-6 py-4 font-bold text-green-600">
                    {app.price * 0.8} ج.م
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
