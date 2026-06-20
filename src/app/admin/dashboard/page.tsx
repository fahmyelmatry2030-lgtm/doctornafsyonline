import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/admin/settings/actions";
import { 
  Users, UserCheck, Video, TrendingUp, 
  Calendar, ShieldAlert, ArrowUpRight,
  DollarSign, Activity, FileText, CheckCircle
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);


  let dbData;
  try {
    const transactionResults = await prisma.$transaction([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({ where: { role: "THERAPIST" } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: today, lte: endOfDay } } }),
      prisma.appointment.count({ where: { status: "IN_PROGRESS" } }),
      prisma.therapistProfile.count({ where: { isVerified: false } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.appointment.aggregate({ _sum: { price: true }, where: { status: "COMPLETED", createdAt: { gte: firstDayOfMonth } } }),
      prisma.appointment.aggregate({ _sum: { price: true }, where: { status: "COMPLETED", createdAt: { gte: lastMonth, lt: firstDayOfMonth } } }),
      prisma.appointment.findMany({ include: { patient: { select: { name: true } }, therapist: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.user.findMany({ where: { role: "THERAPIST", therapistProfile: { isVerified: false } }, include: { therapistProfile: true }, take: 4 })
    ]);

    const settings = await getSettings();

    dbData = [...transactionResults, settings];
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm text-center">
        <h2 className="text-2xl font-black text-rose-600 mb-4">حدث خطأ أثناء تحميل لوحة التحكم</h2>
        <p className="text-slate-600">{error.message || "خطأ غير معروف في قاعدة البيانات"}</p>
        <p className="text-sm mt-4 text-slate-400">يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.</p>
      </div>
    );
  }

  const [
    totalPatients, totalTherapists, todaysSessions,
    activeNow, pendingVerifications, totalAppointments,
    completedAppointments, cancelledAppointments,
    monthlyEarningsData, lastMonthEarningsData,
    recentAppointments, pendingTherapists,
    settings
  ] = dbData;

  const commissionFactor = settings.commission / 100;
  const monthlyRevenue = (monthlyEarningsData._sum.price || 0) * commissionFactor;
  const lastMonthRevenue = (lastMonthEarningsData._sum.price || 0) * commissionFactor;
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  const statusLabel: Record<string, string> = {
    PENDING: "قيد الانتظار", CONFIRMED: "مؤكدة",
    IN_PROGRESS: "جارية", COMPLETED: "مكتملة", CANCELLED: "ملغية"
  };
  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border border-amber-200", 
    CONFIRMED: "bg-blue-50 text-blue-600 border border-blue-200",
    IN_PROGRESS: "bg-indigo-50 text-indigo-600 border border-indigo-200", 
    COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-200", 
    CANCELLED: "bg-rose-50 text-rose-600 border border-rose-200"
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="z-10">
          <h1 className="text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2">
            مرحباً بعودتك للوحة القيادة 👋
          </h1>
          <p className="text-[#A3AED0] font-medium text-sm max-w-lg">
            إليك ملخص سريع لأداء المنصة اليوم. لديك <strong className="text-indigo-600">{pendingVerifications} طلبات توثيق</strong> تحتاج لمراجعتك.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 z-10">
          <div className="bg-[#F4F7FE] px-5 py-3 rounded-2xl">
            <p className="text-xs text-[#A3AED0] font-bold mb-1">تاريخ اليوم</p>
            <p className="text-sm font-black text-[#2B3674]">
              {today.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي المرضى", value: totalPatients, icon: <Users className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50", iconBg: "bg-white", shadow: "shadow-blue-500/10" },
          { label: "إجمالي الأخصائيين", value: totalTherapists, icon: <UserCheck className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50", iconBg: "bg-white", shadow: "shadow-emerald-500/10" },
          { label: "جلسات اليوم", value: todaysSessions, icon: <Calendar className="w-6 h-6" />, color: "text-amber-600", bg: "bg-amber-50", iconBg: "bg-white", shadow: "shadow-amber-500/10" },
          { label: "جلسات جارية الآن", value: activeNow, icon: <Activity className="w-6 h-6" />, color: "text-rose-500", bg: "bg-rose-50", iconBg: "bg-white", shadow: "shadow-rose-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#A3AED0] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#2B3674]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complex Data Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Revenue Card (Gradient) */}
        {session.user.role !== "ADMIN_HR" && (
        <div className="lg:col-span-1 rounded-[24px] p-7 bg-gradient-to-br from-[#4318FF] to-[#868CFF] text-white shadow-xl shadow-[#4318FF]/20 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-indigo-100 font-bold text-sm mb-1">أرباح المنصة (الشهر الحالي)</p>
            <h2 className="text-4xl font-black mb-4">{monthlyRevenue.toFixed(0)} <span className="text-xl font-bold opacity-80">ج.م</span></h2>
          </div>
          
          <div className="relative z-10 flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl">
            <span className="text-sm font-semibold opacity-90">مقارنة بالشهر الماضي</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className={`text-sm font-bold ${revenueGrowth >= 0 ? "text-green-300" : "text-rose-300"}`}>
                {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}%
              </span>
            </div>
          </div>
        </div>
        )}

        {/* Total Sessions Breakdown */}
        <div className={`${session.user.role === "ADMIN_HR" ? "lg:col-span-3" : "lg:col-span-2"} bg-white rounded-[24px] p-7 shadow-sm`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#2B3674] text-lg flex items-center gap-2">
              <Video className="w-5 h-5 text-[#4318FF]" /> ملخص حالة الجلسات
            </h3>
            <span className="text-xs font-bold bg-[#F4F7FE] text-[#4318FF] px-3 py-1.5 rounded-lg">إجمالي: {totalAppointments} جلسة</span>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-[#2B3674] mb-1">{completedAppointments}</p>
              <p className="text-sm font-bold text-[#A3AED0]">جلسات مكتملة</p>
            </div>
            
            <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-[#2B3674] mb-1">{activeNow + todaysSessions}</p>
              <p className="text-sm font-bold text-[#A3AED0]">جلسات نشطة/مؤكدة</p>
            </div>
            
            <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-rose-200 transition-colors">
              <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-[#2B3674] mb-1">{cancelledAppointments}</p>
              <p className="text-sm font-bold text-[#A3AED0]">جلسات ملغية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Pending Therapists Table/List */}
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
            <h2 className="font-black text-[#2B3674] text-lg flex items-center gap-2">
              طلبات التوثيق <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded-md">{pendingVerifications}</span>
            </h2>
            <Link href="/admin/therapists" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
              إدارة الكل <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 flex-1">
            {pendingTherapists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-3">
                  <ShieldAlert className="w-8 h-8 text-[#A3AED0]" />
                </div>
                <p className="text-[#A3AED0] font-bold text-sm">لا توجد طلبات توثيق معلقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTherapists.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-[#F4F7FE]/50 rounded-2xl hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#4318FF]/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4318FF] to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#2B3674]">{t.name}</p>
                        <p className="text-xs font-bold text-[#A3AED0]">{t.email}</p>
                      </div>
                    </div>
                    <Link href="/admin/therapists"
                      className="text-xs font-bold bg-white text-[#4318FF] px-4 py-2 rounded-xl shadow-sm border border-[#F4F7FE] hover:bg-[#4318FF] hover:text-white transition-all">
                      مراجعة
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
            <h2 className="font-black text-[#2B3674] text-lg">أحدث الحجوزات</h2>
            <Link href="/admin/operations" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
              عرض العمليات <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-0">
            <div className="w-full">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-12 text-[#A3AED0] font-bold text-sm">لا توجد حجوزات حديثة</div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#F4F7FE]/50 text-[#A3AED0] text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">المريض / الأخصائي</th>
                      <th className="px-6 py-4 font-bold">التاريخ والتكلفة</th>
                      <th className="px-6 py-4 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F7FE]">
                    {recentAppointments.map(app => (
                      <tr key={app.id} className="hover:bg-[#F4F7FE]/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-[#2B3674]">{app.patient.name}</p>
                          <p className="text-xs font-bold text-[#A3AED0]">مع: {app.therapist.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[#2B3674]">{app.scheduledAt.toLocaleDateString("ar-EG")}</p>
                          <p className="text-xs font-bold text-[#A3AED0]">{app.price} ج.م</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${statusColor[app.status]}`}>
                            {statusLabel[app.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
