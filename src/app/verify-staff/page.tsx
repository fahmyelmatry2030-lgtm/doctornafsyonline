import { prisma } from "@/lib/prisma";
import { ShieldCheck, ShieldAlert, Award, Calendar, User, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Translate role keys to reader-friendly Arabic titles
function getRoleArabicLabel(role: string) {
  if (role === "ADMIN") return "مدير عام النظام";
  if (role === "ADMIN_HR") return "إدارة الموارد البشرية (HR)";
  if (role === "ADMIN_ACCOUNTING") return "الإدارة المالية والحسابات";
  if (role === "ADMIN_VIEWER") return "مراقب لوحة التحكم";
  if (role === "SHIFT_LEADER") return "قائد الشيفت (Shift Leader)";
  if (role === "ADMIN_CUSTOMER_SERVICE") return "إدارة خدمة العملاء";
  return "عضو فريق العمل";
}

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function VerifyStaffPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const userId = resolvedSearchParams.code;

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-xl w-full mx-auto space-y-8 my-auto text-center">
          <div className="flex flex-col items-center space-y-2">
            <Link href="/" className="flex flex-col items-center space-y-1.5 transition-transform hover:scale-103">
              <img src="/logo.jpeg" alt="Doctor Nafsy" className="h-14 w-auto object-contain rounded-lg shadow-sm" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 tracking-wide">دكتور نفسي أونلاين</p>
                <p className="text-[10px] text-[#A3AED0] font-extrabold font-mono tracking-wider">Doctor Nafsy Online</p>
              </div>
            </Link>
            <h2 className="text-xl font-bold text-slate-800 mt-2">نظام توثيق واعتماد فريق العمل</h2>
            <p className="text-xs text-slate-500">يرجى استخدام رمز الاستجابة السريعة (QR Code) الخاص بالموظف للتحقق</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-700">كود التحقق غير متوفر</p>
            <p className="text-xs text-slate-500 mt-2">يرجى مسح كود الـ QR الموجود على بطاقة تعريف الموظف للتحقق من هويته وصلاحية عمله بالمنصة.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch the user details
  const employee = await prisma.user.findFirst({
    where: {
      id: userId,
      role: {
        in: ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", "SHIFT_LEADER", "ADMIN_CUSTOMER_SERVICE"]
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      isSuspended: true,
      createdAt: true,
    }
  });

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-xl w-full mx-auto space-y-8 my-auto text-center">
          <div className="flex flex-col items-center space-y-2">
            <Link href="/" className="flex flex-col items-center space-y-1.5 transition-transform hover:scale-103">
              <img src="/logo.jpeg" alt="Doctor Nafsy" className="h-14 w-auto object-contain rounded-lg shadow-sm" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 tracking-wide">دكتور نفسي أونلاين</p>
                <p className="text-[10px] text-[#A3AED0] font-extrabold font-mono tracking-wider">Doctor Nafsy Online</p>
              </div>
            </Link>
            <h2 className="text-xl font-bold text-slate-800 mt-2">نظام توثيق واعتماد فريق العمل</h2>
          </div>
          <div className="bg-white rounded-3xl border border-red-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-650 p-6 text-center text-white space-y-2">
              <ShieldAlert className="w-16 h-16 mx-auto stroke-1" />
              <h3 className="text-lg font-black">الموظف غير مسجل أو غير معتمد!</h3>
            </div>
            <div className="p-6 text-center space-y-4">
              <p className="text-sm text-slate-650 leading-relaxed">
                لم يتم العثور على أي موظف مسجل في منصة نفسي بالرمز المرفق.
              </p>
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start gap-2.5 text-right text-xs text-red-700 leading-relaxed">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>
                  <strong>تنبيه هام:</strong> يرجى التحقق من البطاقة التعريفية والتأكد من أنها صادرة من الإدارة الرسمية لمنصة نَفْسي أونلاين.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = !employee.isSuspended;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-xl w-full mx-auto space-y-8 my-auto">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex flex-col items-center space-y-1.5 transition-transform hover:scale-103">
            <img src="/logo.jpeg" alt="Doctor Nafsy" className="h-14 w-auto object-contain rounded-lg shadow-sm" />
            <div className="text-center">
              <p className="text-lg font-black text-slate-800 tracking-wide">دكتور نفسي أونلاين</p>
              <p className="text-[10px] text-[#A3AED0] font-extrabold font-mono tracking-wider">Doctor Nafsy Online</p>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 mt-2">نظام توثيق واعتماد فريق العمل</h2>
          <p className="text-xs text-slate-500">تحقق من صحة وصلاحية بطاقات الهوية لمديري وأعضاء فريق العمل بالمنصة</p>
        </div>

        {/* Verification Result */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in relative">
          {/* Header depending on state */}
          {isVerified ? (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white space-y-2 relative">
              <div className="absolute top-2 left-4 w-20 h-20 border border-white/10 rounded-full flex items-center justify-center rotate-12 select-none pointer-events-none">
                <span className="text-[7px] text-white/20 font-black tracking-widest text-center leading-none">NAFSI<br/>OFFICIAL<br/>STAFF</span>
              </div>
              <ShieldCheck className="w-16 h-16 mx-auto stroke-1 text-emerald-100 drop-shadow-sm" />
              <h3 className="text-xl font-black">عضو معتمد وفروع في فريق العمل</h3>
              <p className="text-[10px] text-emerald-100/90 font-bold uppercase tracking-widest font-mono">
                STAFF ID: {employee.id}
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-500 to-red-650 p-6 text-center text-white space-y-2 relative">
              <ShieldAlert className="w-16 h-16 mx-auto stroke-1 text-red-100 drop-shadow-sm" />
              <h3 className="text-xl font-black">حساب موظف موقوف / غير نشط</h3>
              <p className="text-[10px] text-red-100/90 font-bold uppercase tracking-widest font-mono">
                STAFF ID: {employee.id}
              </p>
            </div>
          )}

          {/* Visual card content */}
          <div className="p-8 space-y-8 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <User className="w-64 h-64" />
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Photo */}
              <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50 border-4 border-white">
                <img
                  src={employee.avatar || "/therapist-placeholder.png"}
                  alt={employee.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="flex h-full w-full items-center justify-center text-3xl font-bold text-white">${employee.name.charAt(0)}</span>`;
                  }}
                />
              </div>

              {/* Name and Title */}
              <div>
                <h4 className="text-2xl font-black text-slate-900 pb-1">
                  {employee.name}
                </h4>
                <div className="bg-indigo-50 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full inline-block mt-1.5">
                  {getRoleArabicLabel(employee.role)}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-6">
              <div className="flex gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">تاريخ الانضمام</span>
                  <span className="font-black text-slate-800">
                    {new Date(employee.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <User className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">حالة الاعتماد</span>
                  <span className={`font-black ${isVerified ? "text-emerald-600" : "text-rose-600"}`}>
                    {isVerified ? "نشط ومعتمد حالياً" : "غير نشط / معلق"}
                  </span>
                </div>
              </div>
            </div>

            {/* Seal / Footer */}
            {isVerified && (
              <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>معتمد رسمياً للعمل بالمنصة في {new Date().getFullYear()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-xs font-bold transition-colors"
          >
            العودة للرئيسية <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
