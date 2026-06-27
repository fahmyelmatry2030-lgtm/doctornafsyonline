import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import ClientDateTime from "@/components/ClientDateTime";
import { formatPrice } from "@/lib/constants";
import {
  Clock,
  CheckCircle2,
  Video,
  Mic,
  MessageCircle,
  CalendarX,
  PlayCircle,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import AppointmentActions from "@/components/AppointmentActions";

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING:     { label: "قيد الانتظار", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  CONFIRMED:   { label: "مؤكدة",        className: "bg-blue-50 text-blue-700 border border-blue-200" },
  IN_PROGRESS: { label: "جارية الآن",  className: "bg-green-50 text-green-700 border border-green-200 animate-pulse" },
  COMPLETED:   { label: "مكتملة",       className: "bg-slate-100 text-slate-600 border border-slate-200" },
  CANCELLED:   { label: "ملغية",        className: "bg-red-50 text-red-600 border border-red-200" },
};

const typeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Video className="w-4 h-4 text-indigo-500" />,
  AUDIO: <Mic className="w-4 h-4 text-teal-500" />,
  CHAT:  <MessageCircle className="w-4 h-4 text-purple-500" />,
};

const typeLabel: Record<string, string> = {
  VIDEO: "فيديو",
  AUDIO: "صوتية",
  CHAT:  "شات",
};

export default async function TherapistSessionsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true },
  });

  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: { therapistId: userId },
    include: { patient: true },
    orderBy: { scheduledAt: "asc" },
  });

  const upcoming = appointments.filter(
    (a) => ["PENDING", "CONFIRMED"].includes(a.status) && new Date(a.scheduledAt) >= now
  );
  const ongoing = appointments.filter((a) => a.status === "IN_PROGRESS");
  const past = appointments.filter(
    (a) =>
      ["COMPLETED", "CANCELLED"].includes(a.status) ||
      (["PENDING", "CONFIRMED"].includes(a.status) && new Date(a.scheduledAt) < now)
  );

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">جلساتي</h1>
        <p className="text-slate-600 mt-2 text-lg">متابعة شاملة لجميع جلساتك السابقة والقادمة.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "الجلسات القادمة", value: upcoming.length, color: "text-indigo-600" },
          { label: "جارية الآن",      value: ongoing.length,  color: "text-green-600" },
          { label: "مكتملة",          value: past.filter((a) => a.status === "COMPLETED").length, color: "text-slate-700" },
        ].map((stat) => (
          <div key={stat.label} className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-5 text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-sm mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Ongoing Sessions */}
      {ongoing.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-green-700 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            جارية الآن
          </h2>
          <div className="space-y-3">
            {ongoing.map((app) => (
              <div
                key={app.id}
                className="card-glow glass rounded-2xl border-2 border-green-200 bg-green-50/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {app.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg">{app.patient.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      {typeIcon[app.type]}
                      <span>جلسة {typeLabel[app.type]}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span><ClientDateTime date={app.scheduledAt} formatStr="hh:mm a" /></span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/session/${app.id}`}
                  className="shrink-0 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-green-600/20"
                >
                  <PlayCircle className="w-5 h-5" /> الدخول للجلسة
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Sessions */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> الجلسات القادمة
        </h2>
        {upcoming.length === 0 ? (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-12 text-center text-slate-500">
            <CalendarX className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-semibold">لا توجد جلسات قادمة حالياً.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((app) => (
              <div
                key={app.id}
                className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {app.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{app.patient.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 flex-wrap">
                      {typeIcon[app.type]}
                      <span>جلسة {typeLabel[app.type]}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        <ClientDateTime date={app.scheduledAt} formatStr="EEEE، d MMMM · hh:mm a" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <AppointmentActions appointmentId={app.id} status={app.status as any} />
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusLabels[app.status].className}`}>
                    {statusLabels[app.status].label}
                  </span>
                  <span className="font-black text-slate-800">{formatPrice(app.price, user?.currency || "EGP")}</span>
                  <Link
                    href={`/session/${app.id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-sm border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    دخول <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-400" /> الجلسات السابقة
        </h2>
        {past.length === 0 ? (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-12 text-center text-slate-500">
            <p className="text-lg font-semibold">لا توجد جلسات سابقة بعد.</p>
          </div>
        ) : (
          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">المريض</th>
                  <th className="px-6 py-4">نوع الجلسة</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {past
                  .slice()
                  .reverse()
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{app.patient.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {typeIcon[app.type]}
                          <span className="text-slate-600">{typeLabel[app.type]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <ClientDateTime date={app.scheduledAt} formatStr="d MMM yyyy · hh:mm a" />
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">{formatPrice(app.price, user?.currency || "EGP")}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusLabels[app.status]?.className}`}>
                          {statusLabels[app.status]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
