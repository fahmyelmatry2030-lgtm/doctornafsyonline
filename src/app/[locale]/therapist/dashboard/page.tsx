import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Video, Clock, CalendarCheck, ArrowUpRight, PlayCircle, Mic,
  MessageCircle, CheckCircle2, BarChart2, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { getTranslations } from "next-intl/server";

const typeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-3.5 h-3.5 text-indigo-500" />,
  AUDIO: <Mic className="w-3.5 h-3.5 text-teal-500" />,
  CHAT:  <MessageCircle className="w-3.5 h-3.5 text-purple-500" />,
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

  const t = await getTranslations("TherapistDashboard");

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    activePatientsCount, todaysSessions,
    pendingCount, completedCount, scheduledCount,
    ongoingSession, upcomingAppointments, recentCompleted, therapistProfile, user
  ] = await Promise.all([
    prisma.appointment.groupBy({ by: ["patientId"], where: { therapistId: userId, status: { in: ["COMPLETED", "CONFIRMED"] } } }).then((r) => r.length),
    prisma.appointment.count({ where: { therapistId: userId, scheduledAt: { gte: today, lte: endOfDay } } }),
    prisma.appointment.count({ where: { therapistId: userId, status: "PENDING" } }),
    prisma.appointment.count({ where: { therapistId: userId, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { therapistId: userId, status: { in: ["CONFIRMED", "PENDING"] }, scheduledAt: { gte: now } } }),
    prisma.appointment.findFirst({ where: { therapistId: userId, status: "IN_PROGRESS" }, include: { patient: true } }),
    prisma.appointment.findMany({ where: { therapistId: userId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledAt: { gte: now } }, include: { patient: true }, orderBy: { scheduledAt: "asc" }, take: 5 }),
    prisma.appointment.findMany({ where: { therapistId: userId, status: "COMPLETED" }, include: { patient: true }, orderBy: { scheduledAt: "desc" }, take: 4 }),
    prisma.therapistProfile.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } }),
  ]);


  return (
    <div className="animate-fade-in space-y-6">
      {/* Avatar Reminder Banner */}
      {!user?.avatar && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-amber-600 text-2xl font-black">!</span>
            </div>
            <div>
              <h3 className="text-amber-900 font-bold text-sm md:text-base">{t("avatarReminderTitle")}</h3>
              <p className="text-amber-700/90 text-xs md:text-sm mt-0.5 font-medium">
                {t("avatarReminderDesc")}
              </p>
            </div>
          </div>
          <Link href="/therapist/profile" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 transition-all">
            {t("uploadAvatarNow")}
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#4318FF]/5 to-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-amber-400/10 to-[#4318FF]/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2">
              {t("welcome", { name: session?.user?.name || "" })}
            </h1>
            <p className="text-[#A3AED0] font-medium text-sm">
              {format(now, "EEEE، d MMMM yyyy", { locale: arSA })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {therapistProfile?.isAvailable ? (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                {t("availableForBookings")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block"></span>
                {t("notAvailableForBookings")}
              </span>
            )}
            <Link href="/therapist/profile" className="bg-[#4318FF] hover:bg-[#3311DB] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#4318FF]/20 transition-all">
              تعديل الملف
            </Link>
          </div>
        </div>
      </div>

      {/* LIVE SESSION ALERT */}
      {ongoingSession && (
        <div className="rounded-[24px] border-2 border-emerald-400 bg-emerald-50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-emerald-500/10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xl">
                {ongoingSession.patient.name.charAt(0)}
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-wide mb-1">{t("ongoingSessionTitle")}</p>
              <p className="font-black text-[#2B3674] text-lg">{ongoingSession.patient.name}</p>
              <p className="text-sm font-bold text-[#A3AED0] flex items-center gap-1.5 mt-1">
                {typeIcon[ongoingSession.type]} {typeLabel[ongoingSession.type]}
              </p>
            </div>
          </div>
          <Link href={`/session/${ongoingSession.id}`} className="shrink-0 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30">
            <PlayCircle className="w-5 h-5" /> {t("joinSession")}
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("activePatients"), value: activePatientsCount, sub: "", icon: <Users className="w-6 h-6" />, color: "text-[#4318FF]", bg: "bg-[#4318FF]/10" },
          { label: t("todaySessions"), value: todaysSessions, sub: pendingCount > 0 ? <span className="text-amber-500">{pendingCount} {t("pendingRequests")}</span> : "", icon: <CalendarCheck className="w-6 h-6" />, color: "text-teal-600", bg: "bg-teal-100" },
          { label: t("completedSessions"), value: completedCount, sub: "", icon: <CheckCircle2 className="w-6 h-6" />, color: "text-emerald-500", bg: "bg-emerald-100" },
          { label: t("todayAppointments"), value: scheduledCount, sub: "", icon: <BarChart2 className="w-6 h-6" />, color: "text-violet-500", bg: "bg-violet-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-[#A3AED0]">{stat.label}</p>
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-[#2B3674]">{stat.value}</p>
            <p className="text-xs font-bold text-[#A3AED0] mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Lists Row (Upcoming & Recent) */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
            <h2 className="font-black text-[#2B3674] text-lg">{t("todayAppointments")}</h2>
            <Link href="/therapist/schedule" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
              {t("viewSchedule")} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 flex-1">
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-3">
                  <CalendarCheck className="w-8 h-8 text-[#A3AED0]" />
                </div>
                <p className="text-[#A3AED0] font-bold text-sm">{t("noAppointmentsToday")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((app) => (
                  <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F4F7FE]/50 rounded-2xl hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#4318FF]/10 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4318FF] to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                        {app.patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[#2B3674] text-sm mb-1">{app.patient.name}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#A3AED0]">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(app.scheduledAt), "EEE، d MMM · hh:mm a", { locale: arSA })}
                          <span className="w-1 h-1 rounded-full bg-[#A3AED0]"></span>
                          {typeIcon[app.type]} {typeLabel[app.type]}
                        </div>
                      </div>
                    </div>
                    <Link href={`/session/${app.id}`} className="shrink-0 text-xs font-bold bg-white text-[#4318FF] px-5 py-2.5 rounded-xl shadow-sm border border-[#F4F7FE] hover:bg-[#4318FF] hover:text-white transition-all text-center">
                      {t("joinSession")}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed */}
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
            <h2 className="font-black text-[#2B3674] text-lg">{t("recentCompletedSessions")}</h2>
            <Link href="/therapist/schedule" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
              {t("allHistory")} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 flex-1">
            {recentCompleted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-[#A3AED0]" />
                </div>
                <p className="text-[#A3AED0] font-bold text-sm">{t("noRecentSessions")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompleted.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-white border border-[#F4F7FE] rounded-2xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black shrink-0">
                        {app.patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[#2B3674] text-sm mb-1">{app.patient.name}</p>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-[#A3AED0]">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(app.scheduledAt), "d MMM · hh:mm a", { locale: arSA })}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                      {t("writeNotes")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
