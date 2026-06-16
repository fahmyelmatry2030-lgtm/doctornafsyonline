import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, FileText, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default async function PatientBillingPage() {
  const session = await auth();
  if (!session?.user) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { therapist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">الفواتير والمدفوعات</h1>
        <p className="text-slate-600 mt-2 text-lg">سجل الجلسات وتفاصيل الدفع الخاصة بك.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" /> طرق الدفع
          </h2>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div>
                <p className="font-bold text-slate-800">**** **** **** 4242</p>
                <p className="text-xs text-slate-500">ينتهي في 12/26</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">الأساسية</span>
          </div>
          <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors">
            + إضافة بطاقة جديدة
          </button>
        </div>

        {/* Total Spent */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col justify-center items-center text-center">
          <p className="text-slate-500 font-semibold mb-2">إجمالي المدفوعات</p>
          <p className="text-5xl font-black text-slate-900">
            {appointments.reduce((sum, app) => sum + app.price, 0)} <span className="text-2xl text-slate-500">ج.م</span>
          </p>
          <p className="text-sm text-slate-400 mt-2">عبر {appointments.length} جلسات</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">سجل الفواتير</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الأخصائي</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">
                    {format(new Date(app.createdAt), 'dd MMMM yyyy', { locale: arSA })}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">د. {app.therapist.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{app.price} ج.م</td>
                  <td className="px-6 py-4">
                    {app.status === "COMPLETED" || app.status === "CONFIRMED" || app.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" /> مدفوع
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold">
                        <Clock className="w-3 h-3" /> معلق
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 font-semibold text-xs hover:underline">تحميل PDF</button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    لا توجد فواتير سابقة.
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
