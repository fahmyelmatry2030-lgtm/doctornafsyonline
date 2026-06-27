import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, FileText, CheckCircle2, Clock, Phone, Landmark, Wallet, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { getSettings } from "@/app/[locale]/admin/settings/actions";
import ScreenshotUploader from "@/components/ScreenshotUploader";
import PayOnlineButton from "@/components/PayOnlineButton";
import { formatPrice } from "@/lib/constants";

export default async function PatientBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status;

  const settings = await getSettings();

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { therapist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in space-y-8">
      {status === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="text-sm font-bold">
            تمت عملية الدفع بنجاح وتأكيد موعد جلستك! ستصلك رسالة تفصيلية على الجوال والواتساب قريباً.
          </div>
        </div>
      )}

      {status === "cancelled" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm font-bold">
            تم إلغاء عملية الدفع. يمكنك إعادة المحاولة في أي وقت أو رفع لقطة شاشة التحويل اليدوي.
          </div>
        </div>
      )}

      {status === "mock_stripe_unavailable" && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm font-bold">
            بوابة الدفع الإلكتروني (Stripe) غير متهيئة حالياً. يرجى إتمام عملية الدفع عبر التحويل المالي (Vodafone Cash / InstaPay) أدناه ورفع لقطة الشاشة كإثبات لتأكيد حجز جلستك.
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">الفواتير والمدفوعات</h1>
        <p className="text-slate-600 mt-2 text-lg">بيانات حسابات التحويل المالي وسجل الجلسات الخاص بك.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Transfer Method 1: Vodafone Cash */}
        {appointments.some(app => app.status === "PENDING" && app.therapist.country === "Egypt") && (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-indigo-50/50 to-white flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" /> المحافظ الإلكترونية كاش
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">فودافون كاش / اتصالات كاش / أورنج كاش</p>
              <div>
                <p className="text-xs font-bold text-slate-400">الرقم:</p>
                <p className="text-xl font-black text-indigo-650 tracking-wide select-all" dir="ltr">
                  {settings.walletVodafone || "01010423661"}
                </p>
              </div>
              {settings.walletVodafoneName && (
                <div>
                  <p className="text-xs font-bold text-slate-400">الاسم المسجل لتأكيد التحويل:</p>
                  <p className="text-sm font-black text-slate-800">{settings.walletVodafoneName}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
              تحويل فوري
            </span>
          </div>
        </div>
        )}

        {/* Transfer Method 2: InstaPay */}
        {appointments.some(app => app.status === "PENDING" && app.therapist.country === "Egypt") && (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-emerald-50/50 to-white flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" /> عنوان إنستا باي (InstaPay)
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">التحويل المباشر عبر تطبيق إنستا باي</p>
              <div>
                <p className="text-xs font-bold text-slate-400">العنوان (IPN Address):</p>
                <p className="text-lg font-black text-emerald-650 tracking-wide select-all" dir="ltr">
                  {settings.walletInstapay || "01010423661@instapay"}
                </p>
              </div>
              {settings.walletInstapayName && (
                <div>
                  <p className="text-xs font-bold text-slate-400">الاسم المسجل:</p>
                  <p className="text-sm font-black text-slate-800">{settings.walletInstapayName}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
              معتمد وآمن
            </span>
          </div>
        </div>
        )}

        {/* Transfer Method 3: Bank Transfer */}
        {appointments.some(app => app.status === "PENDING" && app.therapist.country === "Egypt") && (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-amber-50/50 to-white flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-500" /> التحويل البنكي
            </h2>
            <div className="space-y-2 text-slate-700 text-sm">
              <p className="text-xs text-slate-400">تفاصيل حساب المنصة</p>
              {settings.bankName ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400">البنك:</p>
                    <p className="font-black text-slate-800">{settings.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">رقم الحساب:</p>
                    <p className="font-black text-slate-850 select-all tracking-wide" dir="ltr">{settings.bankAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">الآيبان (IBAN):</p>
                    <p className="text-xs font-black text-slate-850 select-all tracking-wider leading-relaxed" dir="ltr">{settings.bankIban}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-black leading-relaxed select-all whitespace-pre-line text-slate-800">
                  {settings.bankAccount || "البنك الأهلي المصري - حساب رقم 1234567890123456"}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-block text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
              تسوية خلال 24 ساعة
            </span>
          </div>
        </div>
        )}

        {/* Transfer Method 4: Online Stripe Payment */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 bg-gradient-to-br from-purple-50/50 to-white flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-500" /> الدفع الإلكتروني بالبطاقة
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">دفع فوري وآمن من منزلك</p>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                يمكنك الدفع مباشرة باستخدام بطاقة الفيزا أو الماستركارد المفعلة للإنترنت ليتم تأكيد جلستك ودخول غرفة العلاج بشكل تلقائي وفوري.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1">
            <span className="inline-block text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full w-fit">
              تأكيد تلقائي وفوري
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">* اضغط على زر "ادفع أونلاين بالفيزا" في جدول الجلسات أدناه لبدء الدفع.</p>
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
                <th className="px-6 py-4">خيارات تأكيد الدفع الإلكتروني واليدوي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">
                    {format(new Date(app.createdAt), 'dd MMMM yyyy', { locale: arSA })}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">د. {app.therapist.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(app.price, app.therapist.currency)}</td>
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
                        <div className="flex flex-col gap-2 max-w-[200px]">
                          <PayOnlineButton appointmentId={app.id} />
                          {app.therapist.country === "Egypt" ? (
                            <>
                              <div className="relative flex items-center justify-center my-1">
                                <span className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-slate-200"></span>
                                </span>
                                <span className="relative bg-white px-2 text-[10px] text-slate-400 font-bold">أو تحويل يدوي</span>
                              </div>
                              <ScreenshotUploader appointmentId={app.id} />
                            </>
                          ) : (
                            <div className="text-[10px] text-purple-600 font-bold text-center mt-1 bg-purple-50 py-1 rounded">
                              الدفع بالفيزا فقط
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <span className="text-slate-400">—</span>
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

