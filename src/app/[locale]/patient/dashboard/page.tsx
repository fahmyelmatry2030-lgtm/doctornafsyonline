import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Video, Clock, MessageCircle, ArrowUpRight, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import ClientDateTime from "@/components/ClientDateTime";
import { getTranslations } from "next-intl/server";

export default async function PatientDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const t = await getTranslations("PatientDashboard");

  // Fetch upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId: userId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: new Date() },
    },
    include: { therapist: true },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  // Fetch stats
  const totalCompleted = await prisma.appointment.count({
    where: { patientId: userId, status: "COMPLETED" }
  });

  const upcomingCount = await prisma.appointment.count({
    where: { patientId: userId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledAt: { gte: new Date() } }
  });

  // Fetch if there is any unrated completed appointment
  const unratedAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: userId,
      status: "COMPLETED",
      review: null,
    },
    include: {
      therapist: { select: { name: true } }
    }
  });

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#4318FF]/10 to-purple-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-sky-400/10 to-indigo-500/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10">
          <h1 className="text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2">
            {t("welcome", { name: session?.user?.name || "" })}
          </h1>
          <p className="text-[#A3AED0] font-medium text-sm max-w-lg">
            {t("welcomeDesc")}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 z-10">
          <Link href="/therapists" className="bg-[#4318FF] hover:bg-[#3311DB] text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#4318FF]/20 transition-all flex items-center gap-2">
            <Calendar className="w-5 h-5" /> {t("bookNewSession")}
          </Link>
        </div>
      </div>

      {/* Review Alert Banner */}
      {unratedAppointment && (
        <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h3 className="font-black text-[#2B3674] text-base mb-1">{t("reviewPreviousSession")}</h3>
              <p className="text-sm font-medium text-amber-800">
                {t("reviewDesc", { name: unratedAppointment.therapist.name })}
              </p>
            </div>
          </div>
          <Link
            href="/patient/reviews"
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            {t("reviewNow")}
          </Link>
        </div>
      )}

      {/* Main Stats Row */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-full bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">{t("upcomingSessions")}</p>
              <p className="text-3xl font-black text-[#2B3674]">{upcomingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center`}>
              <Video className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">{t("completedSessions")}</p>
              <p className="text-3xl font-black text-[#2B3674]">{totalCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center`}>
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">{t("totalSessions")}</p>
              <p className="text-3xl font-black text-[#2B3674]">{totalCompleted + upcomingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments List */}
      <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
        <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
          <h2 className="font-black text-[#2B3674] text-lg">{t("nextAppointments")}</h2>
          <Link href="/patient/appointments" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
            {t("viewAll")} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-4">
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#A3AED0]" />
              </div>
              <p className="text-[#A3AED0] font-bold text-sm mb-4">{t("noUpcoming")}</p>
              <Link href="/therapists" className="text-sm font-bold bg-white text-[#4318FF] border border-[#F4F7FE] px-5 py-2.5 rounded-xl hover:bg-[#F4F7FE] transition-colors">
                {t("browseTherapists")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(app => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F4F7FE]/50 rounded-2xl hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#4318FF]/10 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#4318FF] to-purple-600 p-[2px] shadow-md shadow-[#4318FF]/20">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white">
                        {app.therapist.avatar ? (
                          <img src={encodeURI(decodeURI(app.therapist.avatar))} alt={app.therapist.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-[#4318FF] font-black text-lg">
                            {app.therapist.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-[#2B3674] text-base mb-1">د. {app.therapist.name}</h4>
                      <p className="text-xs font-bold text-[#A3AED0] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        <ClientDateTime date={app.scheduledAt} formatStr="EEEE، d MMMM yyyy - hh:mm a" />
                      </p>
                    </div>
                  </div>
                  <Link href={`/session/${app.id}`} className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] rounded-xl shadow-lg shadow-[#4318FF]/20 transition-all">
                    <PlayCircle className="w-4 h-4" /> {t("joinSession")}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
