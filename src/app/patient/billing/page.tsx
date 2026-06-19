import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, FileText, CheckCircle2, Clock, Phone, Landmark, Wallet, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import ScreenshotUploader from "@/components/ScreenshotUploader";

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
        <p className="text-slate-600 mt-2 text-lg">بيانات حسابات التحويل المالي وسجل الجلسات الخاص بك.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Transfer Method 1: Cash Wallets */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-indigo-50/50 to-white">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" /> المحافظ الإلكترونية كاش
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">فودافون كاش / اتصالات كاش / أورنج كاش</p>
            <p className="text-2xl font-black text-indigo-600 tracking-wide select-all" dir="ltr">
              01010423661
            </p>
            <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              تحويل فوري
            </span>
          </div>
        </div>

        {/* Transfer Method 2: InstaPay */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-emerald-50/50 to-white">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" /> عنوان إنستا باي (InstaPay)
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-slate-500">التحويل المباشر عبر تطبيق إنستا باي</p>
            <p className="text-2xl font-black text-emerald-600 tracking-all select-all" dir="ltr">
              01010423661@instapay
            </p>
            <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
              معتمد
            </span>
          </div>
        </div>

        {/* Transfer Method 3: Bank Transfer */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-amber-50/50 to-white">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" /> التحويل البنكي
          </h2>
          <div className="space-y-1.5 text-slate-700">
            <p className="text-xs text-slate-500">البنك الأهلي المصري</p>
            <p className="text-sm font-bold"><span className="text-slate-400">حساب رقم:</span> <span className="font-black select-all">100020304050</span></p>
            <p className="text-xs font-bold text-slate-600 leading-none overflow-hidden text-ellipsis whitespace-nowrap"><span className="text-slate-400">IBAN:</span> <span className="font-black select-all">EG12345678901234567890123456</span></p>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">سجل الفواتير والجلسات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الأخصائي</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">تأكيد الدفع / الفاتورة</th>
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
                    ) : app.paymentScreenshot ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">
                        <Clock className="w-3 h-3" /> بانتظار الاعتماد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold">
                        <AlertCircle className="w-3 h-3" /> بانتظار الدفع
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {app.status === "PENDING" ? (
                      app.paymentScreenshot ? (
                        <span className="text-xs text-slate-400 font-semibold">تم رفع الإثبات وفي مراجعة الحسابات</span>
                      ) : (
                        <div className="max-w-[200px]">
                          <ScreenshotUploader appointmentId={app.id} />
                        </div>
                      )
                    ) : (
                      <button className="text-indigo-600 font-semibold text-xs hover:underline">تحميل PDF</button>
                    )}
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
