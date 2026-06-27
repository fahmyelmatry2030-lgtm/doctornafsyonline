import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/app/[locale]/admin/settings/actions";
import { 
  Users, UserCheck, Video, TrendingUp, 
  Calendar, ShieldAlert, ArrowUpRight,
  DollarSign, Activity, FileText, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const t = await getTranslations("AdminDashboard");

  try {
    // Use Egypt timezone so the date matches the user's local time
    const nowInEgypt = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const today = new Date(nowInEgypt);
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

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
      prisma.user.findMany({ where: { role: "THERAPIST", therapistProfile: { isVerified: false } }, include: { therapistProfile: true }, take: 4 }),
      // Query therapists with active trial (createdAt exists on profile, we check those who do NOT have annual approved contract)
      prisma.user.findMany({
        where: {
          role: "THERAPIST",
        },
        include: { therapistProfile: true }
      })
    ]);

    const settings = await getSettings();

    const [
      totalPatients, totalTherapists, todaysSessions,
      activeNow, pendingVerifications, totalAppointments,
      completedAppointments, cancelledAppointments,
      monthlyEarningsData, lastMonthEarningsData,
      recentAppointments, pendingTherapists, allTherapists
    ] = transactionResults;

    // Filter out therapists who are in day 11-14 or locked at 15+ days and have no approved annual contract
    const nowTime = new Date().getTime();
    const trialExpiringSoon: Array<any> = [];
    const trialExpiredLocked: Array<any> = [];

    allTherapists.forEach((therapist: any) => {
      if (!therapist.therapistProfile) return;
      const profileCreatedAt = new Date(therapist.therapistProfile.createdAt).getTime();
      const daysSinceCreation = (nowTime - profileCreatedAt) / (1000 * 60 * 60 * 24);

      let annualApproved = false;
      const contractVal = therapist.therapistProfile.contractUrl;
      if (contractVal && contractVal.startsWith("{")) {
        try {
          const parsed = JSON.parse(contractVal);
          if (parsed.annual && parsed.annual.status === "APPROVED") {
            annualApproved = true;
          }
        } catch {}
      }

      if (!annualApproved) {
        if (daysSinceCreation >= 14) {
          trialExpiredLocked.push({
            ...therapist,
            days: Math.floor(daysSinceCreation)
          });
        } else if (daysSinceCreation >= 11) {
          trialExpiringSoon.push({
            ...therapist,
            daysLeft: Math.max(0, Math.ceil(14 - daysSinceCreation))
          });
        }
      }
    });

    const commissionFactor = (settings?.commission || 20) / 100;
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
              {t("welcome")}
            </h1>
            <p className="text-[#A3AED0] font-medium text-sm max-w-lg">
              {t("welcomeDesc")} <strong className="text-indigo-600">{pendingVerifications} {t("pendingVerificationText")}</strong> {t("needsReviewText")}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 z-10">
            <div className="bg-[#F4F7FE] px-5 py-3 rounded-2xl">
              <p className="text-xs text-[#A3AED0] font-bold mb-1">{t("todayDate")}</p>
              <p className="text-sm font-black text-[#2B3674]">
                {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Cairo" })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Row */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("totalPatients"), value: totalPatients, icon: <Users className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50", iconBg: "bg-white", shadow: "shadow-blue-500/10" },
            { label: t("totalTherapists"), value: totalTherapists, icon: <UserCheck className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50", iconBg: "bg-white", shadow: "shadow-emerald-500/10" },
            { label: t("todaySessions"), value: todaysSessions, icon: <Calendar className="w-6 h-6" />, color: "text-amber-600", bg: "bg-amber-50", iconBg: "bg-white", shadow: "shadow-amber-500/10" },
            { label: t("activeSessionsNow"), value: activeNow, icon: <Activity className="w-6 h-6" />, color: "text-rose-500", bg: "bg-rose-50", iconBg: "bg-white", shadow: "shadow-rose-500/10" },
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
              <p className="text-indigo-100 font-bold text-sm mb-1">{t("platformEarnings")}</p>
              <h2 className="text-4xl font-black mb-4">{monthlyRevenue.toFixed(0)} <span className="text-xl font-bold opacity-80">{t("currency")}</span></h2>
            </div>
            
            <div className="relative z-10 flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl">
              <span className="text-sm font-semibold opacity-90">{t("comparedToLastMonth")}</span>
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
                <Video className="w-5 h-5 text-[#4318FF]" /> {t("sessionsSummary")}
              </h3>
              <span className="text-xs font-bold bg-[#F4F7FE] text-[#4318FF] px-3 py-1.5 rounded-lg">{t("totalSessionsLabel", { total: totalAppointments })}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-[#2B3674] mb-1">{completedAppointments}</p>
                <p className="text-sm font-bold text-[#A3AED0]">{t("completedSessions")}</p>
              </div>
              
              <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-amber-200 transition-colors">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-[#2B3674] mb-1">{activeNow + todaysSessions}</p>
                <p className="text-sm font-bold text-[#A3AED0]">{t("activeConfirmedSessions")}</p>
              </div>
              
              <div className="bg-[#F4F7FE] rounded-2xl p-5 border border-transparent hover:border-rose-200 transition-colors">
                <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-[#2B3674] mb-1">{cancelledAppointments}</p>
                <p className="text-sm font-bold text-[#A3AED0]">{t("cancelledSessions")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Status & Expirations Section */}
        {(trialExpiringSoon.length > 0 || trialExpiredLocked.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trial Expiring Soon */}
            {trialExpiringSoon.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[24px] p-6 shadow-sm">
                <h3 className="font-black text-amber-900 text-base flex items-center gap-2 mb-4">
                  ⚠️ أخصائيون أوشكت فترة تجربتهم على الانتهاء ({trialExpiringSoon.length})
                </h3>
                <div className="space-y-3">
                  {trialExpiringSoon.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3.5 bg-white/80 rounded-2xl border border-amber-100">
                      <div>
                        <p className="text-sm font-black text-slate-800">{req.name}</p>
                        <p className="text-xs text-amber-700 font-bold mt-0.5">متبقي {req.daysLeft} أيام على انتهاء الـ 14 يوم</p>
                      </div>
                      <Link href={`/admin/therapists?search=${encodeURIComponent(req.name)}`}
                        className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all">
                        مراجعة وإرسال العقد
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trial Expired & Locked */}
            {trialExpiredLocked.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-[24px] p-6 shadow-sm">
                <h3 className="font-black text-red-900 text-base flex items-center gap-2 mb-4">
                  🔒 أخصائيون منتهية فترة تجربتهم ومغلقون ({trialExpiredLocked.length})
                </h3>
                <div className="space-y-3">
                  {trialExpiredLocked.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3.5 bg-white/80 rounded-2xl border border-red-100">
                      <div>
                        <p className="text-sm font-black text-slate-800">{req.name}</p>
                        <p className="text-xs text-red-600 font-bold mt-0.5">انتهت فترة التجربة من {req.days} يوم (مغلق حالياً)</p>
                      </div>
                      <Link href={`/admin/therapists?search=${encodeURIComponent(req.name)}`}
                        className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm transition-all">
                        مراجعة الملف
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lists Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Pending Therapists Table/List */}
          <div className="bg-white rounded-[24px] shadow-sm overflow-hidden flex flex-col">
            <div className="px-7 py-6 flex items-center justify-between border-b border-[#F4F7FE]">
              <h2 className="font-black text-[#2B3674] text-lg flex items-center gap-2">
                {t("verificationRequests")} <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded-md">{pendingVerifications}</span>
              </h2>
              <Link href="/admin/therapists" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
                {t("manageAll")} <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 flex-1">
              {pendingTherapists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center mb-3">
                    <ShieldAlert className="w-8 h-8 text-[#A3AED0]" />
                  </div>
                  <p className="text-[#A3AED0] font-bold text-sm">{t("noPendingVerifications")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTherapists.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-[#F4F7FE]/50 rounded-2xl hover:bg-[#F4F7FE] transition-colors border border-transparent hover:border-[#4318FF]/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4318FF] to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#2B3674]">{req.name}</p>
                          <p className="text-xs font-bold text-[#A3AED0]">{req.email}</p>
                        </div>
                      </div>
                      <Link href="/admin/therapists"
                        className="text-xs font-bold bg-white text-[#4318FF] px-4 py-2 rounded-xl shadow-sm border border-[#F4F7FE] hover:bg-[#4318FF] hover:text-white transition-all">
                        {t("review")}
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
              <h2 className="font-black text-[#2B3674] text-lg">{t("recentAppointments")}</h2>
              {session.user.role !== "ADMIN_HR" && (
                <Link href="/admin/operations" className="text-sm font-bold text-[#4318FF] hover:text-[#3311DB] flex items-center gap-1 transition-colors">
                  {t("viewOperations")} <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="p-0">
              <div className="w-full">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-12 text-[#A3AED0] font-bold text-sm">{t("noRecentAppointments")}</div>
                ) : (
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-[#F4F7FE]/50 text-[#A3AED0] text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold">{t("patientTherapistCol")}</th>
                        <th className="px-6 py-4 font-bold">{session.user.role !== "ADMIN_HR" ? t("dateCostCol") : t("dateCol")}</th>
                        <th className="px-6 py-4 font-bold">{t("statusCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F7FE]">
                      {recentAppointments.map((app: any) => (
                        <tr key={app.id} className="hover:bg-[#F4F7FE]/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-[#2B3674]">{app.patient?.name || 'Unknown Patient'}</p>
                            <p className="text-xs font-bold text-[#A3AED0]">{t("with")} {app.therapist?.name || 'Unknown Therapist'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#2B3674]">{app.scheduledAt.toLocaleDateString("ar-EG")}</p>
                            {session.user.role !== "ADMIN_HR" && (
                              <p className="text-xs font-bold text-[#A3AED0]">{app.price} {t("currency")}</p>
                            )}
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
  } catch (error: any) {
    console.error("Dashboard Global Error:", error);
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm text-center">
        <h2 className="text-2xl font-black text-rose-600 mb-4">{t("dashboardError")}</h2>
        <p className="text-slate-600 font-bold mb-4">Error Details for Support:</p>
        <div className="bg-slate-100 p-4 rounded text-left" dir="ltr">
          <code className="text-xs font-mono text-rose-600 block">{error.message}</code>
          <code className="text-xs font-mono text-slate-500 mt-2 block whitespace-pre-wrap">{error.stack}</code>
        </div>
        <p className="text-sm mt-4 text-slate-400">{t("dashboardErrorDesc")}</p>
      </div>
    );
  }
}
