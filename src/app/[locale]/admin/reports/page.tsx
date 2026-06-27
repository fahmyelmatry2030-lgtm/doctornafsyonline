import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/[locale]/admin/settings/actions";
import {
  TrendingUp, TrendingDown, Users, UserCheck, DollarSign,
  Calendar, Star, BarChart2, PieChart, Activity, ArrowUpRight,
  Clock, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import TransferVerificationTable from "@/components/TransferVerificationTable";
import PrintReportButton from "@/components/PrintReportButton";
import { formatPrice } from "@/lib/constants";

export default async function AdminReportsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) return null;
  const isReadOnly = role === "ADMIN_VIEWER";

  const now = new Date();
  const startOfThisMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [
    totalPatients, totalTherapists, totalAppointments,
    completedAppts, cancelledAppts, pendingAppts,
    thisMonthAppts, lastMonthAppts,
    thisMonthRevData, lastMonthRevData,
    avgRatingData, totalReviews,
    newPatientsThisMonth, newPatientsLastMonth,
    newTherapistsThisMonth,
    top5Therapists,
    recentActivity,
    suspendedUsers,
    settings,
    pendingTransfers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "THERAPIST" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.appointment.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.appointment.aggregate({ _sum: { price: true }, where: { status: "COMPLETED", createdAt: { gte: startOfThisMonth } } }),
    prisma.appointment.aggregate({ _sum: { price: true }, where: { status: "COMPLETED", createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.count(),
    prisma.user.count({ where: { role: "PATIENT", createdAt: { gte: startOfThisMonth } } }),
    prisma.user.count({ where: { role: "PATIENT", createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.user.count({ where: { role: "THERAPIST", createdAt: { gte: startOfThisMonth } } }),
    prisma.user.findMany({
      where: { role: "THERAPIST" },
      include: {
        therapistProfile: { select: { pricePerSession: true, rating: true, reviewCount: true } },
        _count: { select: { therapistAppointments: true } },
        therapistAppointments: { where: { status: "COMPLETED" }, select: { price: true } },
      },
      orderBy: { therapistAppointments: { _count: "desc" } },
      take: 5,
    }),
    prisma.appointment.findMany({
      include: {
        patient: { select: { name: true } },
        therapist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.user.count({ where: { isSuspended: true } }),
    getSettings(),
    prisma.appointment.findMany({
      where: {
        status: "PENDING",
        paymentScreenshot: { not: null },
      },
      include: {
        patient: { select: { name: true, email: true } },
        therapist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const commissionFactor = settings.commission / 100;
  const thisMonthRevenue = (thisMonthRevData._sum.price || 0) * commissionFactor;
  const lastMonthRevenue = (lastMonthRevData._sum.price || 0) * commissionFactor;
  const revenueGrowth    = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
  const apptGrowth       = lastMonthAppts   > 0 ? Math.round(((thisMonthAppts - lastMonthAppts) / lastMonthAppts) * 100) : 0;
  const patientGrowth    = newPatientsLastMonth > 0 ? Math.round(((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100) : 0;
  const completionRate   = totalAppointments > 0 ? Math.round((completedAppts / totalAppointments) * 100) : 0;
  const avgRating        = avgRatingData._avg.rating ?? 0;

  const statusLabel: Record<string, string> = {
    PENDING: "انتظار", CONFIRMED: "مؤكدة",
    IN_PROGRESS: "جارية", COMPLETED: "مكتملة", CANCELLED: "ملغية"
  };
  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-green-100 text-green-700",
    COMPLETED: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-red-100 text-red-700"
  };

  const GrowthBadge = ({ val }: { val: number }) => (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${val >= 0 ? "text-emerald-600" : "text-red-500"}`}>
      {val >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {val >= 0 ? "+" : ""}{val}%
    </span>
  );

  return (
    <div className="space-y-6 print:bg-white print:p-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2B3674]">التقارير وحسابات المنصة</h1>
          <p className="text-[#A3AED0] mt-2">
            نظرة شاملة على أداء المنصة، الإيرادات، نمو المستخدمين، وأحدث النشاطات.
          </p>
        </div>
        <PrintReportButton />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "إيرادات الشهر",
            value: `${thisMonthRevenue.toFixed(0)} ج.م`,
            growth: revenueGrowth,
            icon: <DollarSign className="w-6 h-6" />,
            color: "text-indigo-600", bg: "bg-indigo-50",
          },
          {
            label: "حجوزات الشهر",
            value: thisMonthAppts,
            growth: apptGrowth,
            icon: <Calendar className="w-6 h-6" />,
            color: "text-emerald-600", bg: "bg-emerald-50",
          },
          {
            label: "مرضى جدد",
            value: newPatientsThisMonth,
            growth: patientGrowth,
            icon: <Users className="w-6 h-6" />,
            color: "text-purple-600", bg: "bg-purple-50",
          },
          {
            label: "متوسط التقييم",
            value: avgRating.toFixed(1) + " ★",
            growth: 0,
            icon: <Star className="w-6 h-6" />,
            color: "text-amber-600", bg: "bg-amber-50",
          },
        ].map(kpi => (
          <div key={kpi.label} className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{kpi.label}</p>
                <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <GrowthBadge val={kpi.growth} />
                  <span>عن الشهر الماضي</span>
                </div>
              </div>
              <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Overview + Session Stats */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Platform Summary */}
        <div className="glass rounded-3xl border border-[var(--color-border-soft)] p-6 space-y-4">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" /> ملخص المنصة
          </h2>
          <div className="space-y-3">
            {[
              { label: "إجمالي المرضى", value: totalPatients, icon: <Users className="w-4 h-4" />, color: "text-indigo-600" },
              { label: "إجمالي الأخصائيين", value: totalTherapists, icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-600" },
              { label: "جديد هذا الشهر (أخصائيين)", value: newTherapistsThisMonth, icon: <ArrowUpRight className="w-4 h-4" />, color: "text-purple-600" },
              { label: "حسابات موقوفة", value: suspendedUsers, icon: <AlertCircle className="w-4 h-4" />, color: "text-red-500" },
              { label: "إجمالي التقييمات", value: totalReviews, icon: <Star className="w-4 h-4" />, color: "text-amber-600" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className={`flex items-center gap-2 text-sm text-slate-600 ${r.color}`}>
                  {r.icon}
                  <span className="text-slate-600">{r.label}</span>
                </div>
                <span className={`font-black text-lg ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Breakdown */}
        <div className="glass rounded-3xl border border-[var(--color-border-soft)] p-6 space-y-4 lg:col-span-2">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" /> تفصيل الجلسات الكلية
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "إجمالي الحجوزات", value: totalAppointments, icon: <Calendar className="w-5 h-5" />, color: "text-slate-700", bg: "bg-slate-100" },
              { label: "مكتملة", value: completedAppts, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "ملغية", value: cancelledAppts, icon: <XCircle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
              { label: "معلقة", value: pendingAppts, icon: <Clock className="w-5 h-5" />, color: "text-amber-700", bg: "bg-amber-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-5 flex items-center gap-3`}>
                <div className={s.color}>{s.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Completion Rate Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
              <span className="flex items-center gap-1"><Activity className="w-4 h-4 text-emerald-500" /> معدل الإتمام</span>
              <span className="text-emerald-600 font-black">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Therapists + Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Top 5 Therapists */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-800">أفضل الأخصائيين أداءً</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {top5Therapists.map((t, i) => {
              const earned = t.therapistAppointments.reduce((s, a) => s + a.price, 0);
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-100 text-slate-600" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-50 text-slate-400"
                  }`}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-slate-400">{t._count.therapistAppointments} جلسة · ★ {t.therapistProfile?.rating?.toFixed(1)}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600 shrink-0">{earned.toLocaleString()} ج.م</span>
                </div>
              );
            })}
            {top5Therapists.length === 0 && (
              <p className="text-center py-10 text-sm text-slate-400">لا توجد بيانات بعد.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-slate-800">آخر الأنشطة</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map(app => (
              <div key={app.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{app.patient.name} ← {app.therapist.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(app.scheduledAt).toLocaleDateString("ar-EG")} · {formatPrice(app.price, (app as any).currency || "EGP")}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusColor[app.status]}`}>
                  {statusLabel[app.status]}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center py-10 text-sm text-slate-400">لا توجد أنشطة بعد.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Verification Section */}
      <div className="mt-8">
        <TransferVerificationTable initialTransfers={pendingTransfers as any} isReadOnly={isReadOnly} />
      </div>
    </div>
  );
}
