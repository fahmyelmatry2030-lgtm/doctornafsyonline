import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Video, Clock } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default async function PatientDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

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

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">مرحباً بك، {session?.user?.name}</h1>
        <p className="text-slate-600 mt-2 text-lg">أهلاً بك في بوابة المريض الخاصة بك. كيف تشعر اليوم؟</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)]">
          <h3 className="text-slate-500 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> الجلسات القادمة
          </h3>
          <p className="text-3xl font-black text-[#6366F1]">{upcomingCount}</p>
        </div>
        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)]">
          <h3 className="text-slate-500 font-semibold mb-2 flex items-center gap-2">
            <Video className="w-5 h-5" /> الجلسات المكتملة
          </h3>
          <p className="text-3xl font-black text-[#10B981]">{totalCompleted}</p>
        </div>
        <div className="card-glow glass rounded-2xl p-6 border border-[var(--color-border-soft)]">
          <h3 className="text-slate-500 font-semibold mb-2">الرسائل غير المقروءة</h3>
          <p className="text-3xl font-black text-[#F59E0B]">0</p>
        </div>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border-soft)] flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-slate-800">مواعيدك القادمة</h2>
          <Link href="/patient/appointments" className="text-sm font-semibold text-[#6366F1] hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">لا توجد جلسات قادمة مجدولة.</p>
              <Link href="/therapists" className="inline-flex items-center justify-center rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-bold text-white hover:bg-[#4F46E5] transition-colors">
                احجز جلسة الآن
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#6366F1]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {app.therapist.avatar ? (
                        <img src={app.therapist.avatar} alt={app.therapist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EEF2FF] text-[#6366F1] font-bold">
                          {app.therapist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">د. {app.therapist.name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 
                        {format(new Date(app.scheduledAt), "EEEE، d MMMM yyyy - hh:mm a", { locale: arSA })}
                      </p>
                    </div>
                  </div>
                  <Link href={`/session/${app.id}`} className="px-4 py-2 text-sm font-semibold text-[#6366F1] bg-[#EEF2FF] rounded-lg hover:bg-[#E0E7FF] transition-colors">
                    دخول الجلسة
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
