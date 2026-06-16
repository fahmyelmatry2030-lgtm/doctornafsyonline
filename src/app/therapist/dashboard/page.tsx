import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Video,
  DollarSign,
  Clock,
  TrendingUp,
  Star,
  CalendarCheck,
  ArrowUpRight,
  PlayCircle,
  Mic,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

const typeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4 text-indigo-400" />,
  AUDIO: <Mic className="w-4 h-4 text-teal-400" />,
  CHAT:  <MessageCircle className="w-4 h-4 text-purple-400" />,
};

const typeLabel: Record<string, string> = {
  VIDEO: "فيديو",
  AUDIO: "صوتية",
  CHAT:  "شات",
};

export default async function TherapistDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activePatientsCount,
    todaysSessions,
    totalEarningsAggr,
    monthEarningsAggr,
    pendingCount,
    completedCount,
    ongoingSession,
    upcomingAppointments,
    recentCompleted,
    therapistProfile,
  ] = await Promise.all([
    // Active patients
    prisma.appointment
      .groupBy({ by: ["patientId"], where: { therapistId: userId, status: { in: ["COMPLETED", "CONFIRMED"] } } })
      .then((r) => r.length),

    // Today's sessions
    prisma.appointment.count({
      where: { therapistId: userId, scheduledAt: { gte: today, lte: endOfDay } },
    }),

    // Total earnings
    prisma.appointment.aggregate({
      _sum: { price: true },
      where: { therapistId: userId, status: "COMPLETED" },
    }),

    // Monthly earnings
    prisma.appointment.aggregate({
      _sum: { price: true },
      where: { therapistId: userId, status: "COMPLETED", createdAt: { gte: firstDayOfMonth } },
    }),

    // Pending requests
    prisma.appointment.count({
      where: { therapistId: userId, status: "PENDING" },
    }),

    // Total completed
    prisma.appointment.count({
      where: { therapistId: userId, status: "COMPLETED" },
    }),

    // Ongoing session right now
    prisma.appointment.findFirst({
      where: { therapistId: userId, status: "IN_PROGRESS" },
      include: { patient: true },
    }),

    // Upcoming appointments (next 5)
    prisma.appointment.findMany({
      where: { therapistId: userId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledAt: { gte: now } },
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),

    // Recent completed (last 3)
    prisma.appointment.findMany({
      where: { therapistId: userId, status: "COMPLETED" },
      include: { patient: true },
      orderBy: { scheduledAt: "desc" },
      take: 3,
    }),

    // Therapist profile
    prisma.therapistProfile.findUnique({ where: { userId } }),
  ]);

  const totalEarnings = totalEarningsAggr._sum.price || 0;
  const monthEarnings = monthEarningsAggr._sum.price || 0;
  const netMonthEarnings = monthEarnings * 0.8;

  return (
    <div className="animate-fade-in space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            مرحباً، د. {session?.user?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            {format(now, "EEEE، d MMMM yyyy", { locale: arSA })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {therapistProfile?.isAvailable ? (
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl text-sm font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              متاح لاستقبال الحجوزات
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block"></span>
              غير متاح حالياً
            </span>
          )}
          <Link
            href="/therapist/profile"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            تعديل الملف
          </Link>
        </div>
      </div>

      {/* LIVE SESSION ALERT */}
      {ongoingSession && (
        <div className="rounded-3xl border-2 border-green-300 bg-green-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-green-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xl">
                {ongoingSession.patient.name.charAt(0)}
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">جلسة جارية الآن</p>
              <p className="font-black text-slate-900 text-lg">{ongoingSession.patient.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                {typeIcon[ongoingSession.type]} جلسة {typeLabel[ongoingSession.type]}
              </p>
            </div>
          </div>
          <Link
            href={`/session/${ongoingSession.id}`}
            className="shrink-0 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-2xl transition-colors shadow-md shadow-green-600/30 text-base"
          >
            <PlayCircle className="w-6 h-6" /> ادخل الجلسة الآن
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-semibold text-sm">مرضى نشطين</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-indigo-600">{activePatientsCount}</p>
          <p className="text-xs text-slate-400">{completedCount} جلسة مكتملة إجمالاً</p>
        </div>

        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-semibold text-sm">جلسات اليوم</p>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-teal-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-teal-600">{todaysSessions}</p>
          <p className="text-xs text-slate-400">
            {pendingCount > 0 ? (
              <span className="text-amber-500 font-bold">{pendingCount} طلب بانتظار موافقتك</span>
            ) : (
              "لا توجد طلبات معلقة"
            )}
          </p>
        </div>

        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-semibold text-sm">أرباح الشهر (صافي)</p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-amber-600">{netMonthEarnings} <span className="text-lg text-slate-400">ج.م</span></p>
          <p className="text-xs text-slate-400">بعد عمولة المنصة 20%</p>
        </div>

        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 font-semibold text-sm">إجمالي الأرباح</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-4xl font-black text-green-600">{totalEarnings * 0.8} <span className="text-lg text-slate-400">ج.م</span></p>
          <p className="text-xs text-slate-400">منذ انضمامك للمنصة</p>
        </div>
      </div>

      {/* Profile Card + Rating */}
      {therapistProfile && (
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-3xl shrink-0">
            {session?.user?.name?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-xl font-black text-slate-900">د. {session?.user?.name}</h2>
            <p className="text-slate-500 text-sm mt-1">{therapistProfile.specializations}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-800">{therapistProfile.rating.toFixed(1)}</span>
                ({therapistProfile.reviewCount} تقييم)
              </span>
              <span>·</span>
              <span>{therapistProfile.yearsExperience} سنوات خبرة</span>
              <span>·</span>
              <span className="font-bold text-indigo-600">{therapistProfile.pricePerSession} ج.م/جلسة</span>
            </div>
          </div>
          {!therapistProfile.isVerified && (
            <div className="shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold">
              <AlertCircle className="w-4 h-4" /> حسابك قيد المراجعة
            </div>
          )}
          {therapistProfile.isVerified && (
            <div className="shrink-0 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> حساب موثّق ✓
            </div>
          )}
        </div>
      )}

      {/* Upcoming + Recent side by side */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Upcoming Appointments */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">الجلسات القادمة</h2>
            <Link href="/therapist/schedule" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              عرض الكل <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا توجد جلسات قادمة</p>
              </div>
            ) : (
              upcomingAppointments.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    {app.patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{app.patient.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(app.scheduledAt), "EEE، d MMM · hh:mm a", { locale: arSA })}
                      <span>·</span>
                      {typeIcon[app.type]}
                      {typeLabel[app.type]}
                    </div>
                  </div>
                  <Link
                    href={`/session/${app.id}`}
                    className="shrink-0 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    دخول
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Completed */}
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">آخر الجلسات المكتملة</h2>
            <Link href="/therapist/earnings" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              الأرباح <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {recentCompleted.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">لم تكتمل أي جلسات بعد</p>
              </div>
            ) : (
              recentCompleted.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold shrink-0">
                    {app.patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{app.patient.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(app.scheduledAt), "d MMM · hh:mm a", { locale: arSA })}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    +{app.price * 0.8} ج.م
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "ملفي المهني",     href: "/therapist/profile",  icon: <Users className="w-5 h-5" />,          color: "text-indigo-600 bg-indigo-50" },
          { label: "المرضى",          href: "/therapist/patients", icon: <Users className="w-5 h-5" />,          color: "text-teal-600 bg-teal-50" },
          { label: "الرسائل",         href: "/therapist/messages", icon: <MessageCircle className="w-5 h-5" />,  color: "text-purple-600 bg-purple-50" },
          { label: "الأرباح",         href: "/therapist/earnings", icon: <DollarSign className="w-5 h-5" />,    color: "text-amber-600 bg-amber-50" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-5 flex flex-col items-center gap-3 text-center hover:border-indigo-200 transition-all hover:shadow-md group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <span className="text-sm font-bold text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
