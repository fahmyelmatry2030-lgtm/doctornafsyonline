import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/admin/settings/actions";
import { 
  Users, UserCheck, Video, TrendingUp, 
  Calendar, Clock, ShieldAlert, ArrowUpRight,
  DollarSign, Activity
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

  const [
    totalPatients, totalTherapists, todaysSessions,
    activeNow, pendingVerifications, totalAppointments,
    completedAppointments, cancelledAppointments,
    monthlyEarningsData, lastMonthEarningsData,
    recentAppointments, pendingTherapists,
    settings
  ] = await Promise.all([
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
    prisma.user.findMany({ where: { role: "THERAPIST", therapistProfile: { isVerified: false } }, include: { therapistProfile: true }, take: 4 }),
    getSettings(),
  ]);

  const commissionFactor = settings.commission / 100;
  const monthlyRevenue = (monthlyEarningsData._sum.price || 0) * commissionFactor;
  const lastMonthRevenue = (lastMonthEarningsData._sum.price || 0) * commissionFactor;
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  const statusLabel: Record<string, string> = {
    PENDING: "قيد الانتظار", CONFIRMED: "مؤكدة",
    IN_PROGRESS: "جارية", COMPLETED: "مكتملة", CANCELLED: "ملغية"
  };
  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-green-100 text-green-700", COMPLETED: "bg-slate-100 text-slate-600", CANCELLED: "bg-red-100 text-red-700"
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">لوحة القيادة</h1>
          <p className="text-slate-600 mt-1">نظرة شاملة على أداء المنصة وإحصائياتها</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          {today.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي المرضى", value: totalPatients, icon: <Users className="w-6 h-6" />, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/patients" },
          { label: "إجمالي الأخصائيين", value: totalTherapists, icon: <UserCheck className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/therapists" },
          { label: "جلسات اليوم", value: todaysSessions, icon: <Calendar className="w-6 h-6" />, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/operations" },
          { label: "جارية الآن", value: activeNow, icon: <Activity className="w-6 h-6" />, color: "text-green-600", bg: "bg-green-50", href: "/admin/operations" },
        ].map((stat) => (
          <Link href={stat.href} key={stat.label}
            className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] hover:shadow-premium transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue + Session Stats Row */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-900/20 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-indigo-200" />
            <h3 className="text-indigo-100 font-semibold">إيرادات المنصة (الشهر)</h3>
          </div>
          <p className="text-4xl font-black">{monthlyRevenue.toFixed(0)} <span className="text-xl text-indigo-200">ج.م</span></p>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className={`text-sm font-bold ${revenueGrowth >= 0 ? "text-green-300" : "text-red-300"}`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}% عن الشهر الماضي
            </span>
          </div>
        </div>

        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] md:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" /> إحصائيات الجلسات الكلية
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "إجمالي الحجوزات", value: totalAppointments, color: "text-slate-800" },
              { label: "مكتملة", value: completedAppointments, color: "text-emerald-600" },
              { label: "ملغية", value: cancelledAppointments, color: "text-red-500" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Verifications + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Pending Therapist Verifications */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-800">طلبات توثيق معلقة</h2>
              {pendingVerifications > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingVerifications}</span>
              )}
            </div>
            <Link href="/admin/therapists" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {pendingTherapists.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">لا توجد طلبات توثيق معلقة حالياً.</p>
            ) : (
              pendingTherapists.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </div>
                  </div>
                  <Link href="/admin/therapists"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
                    مراجعة
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="font-bold text-slate-800">آخر الحجوزات</h2>
            </div>
            <Link href="/admin/operations" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
              عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAppointments.map(app => (
              <div key={app.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">{app.patient.name} → {app.therapist.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{app.scheduledAt.toLocaleDateString("ar-EG")} · {app.price} ج.م</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusColor[app.status]}`}>
                  {statusLabel[app.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: "📝", title: "إدارة المقالات", desc: "إضافة وتعديل مقالات المدونة الطبية", href: "/admin/content" },
          { icon: "🎫", title: "أكواد الخصم", desc: "إنشاء وإدارة كوبونات الخصم الترويجية", href: "/admin/marketing" },
          { icon: "💬", title: "الدعم الفني", desc: "متابعة تذاكر الدعم الفني والرد عليها", href: "/admin/marketing" },
        ].map(card => (
          <Link key={card.href + card.title} href={card.href}
            className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-6 hover:shadow-premium transition-all group hover:border-indigo-200 flex items-start gap-4">
            <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{card.icon}</span>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{card.title}</h3>
              <p className="text-sm text-slate-500">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
