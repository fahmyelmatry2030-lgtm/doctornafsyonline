import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Video, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import RescheduleButton from "@/components/RescheduleButton";
import ClientDateTime from "@/components/ClientDateTime";
import { Phone, MessageCircle } from "lucide-react";

export default async function PatientAppointmentsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: userId },
    include: { therapist: true },
    orderBy: { scheduledAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">قيد الانتظار</span>;
      case "CONFIRMED":
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">مؤكد</span>;
      case "COMPLETED":
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> مكتمل</span>;
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> ملغي</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة الحجوزات</h1>
        <p className="text-slate-600 mt-2 text-lg">تتبع جلساتك القادمة والسابقة.</p>
      </div>

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        {appointments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 p-8">
            <div className="text-5xl mb-4">📅</div>
            <p className="mb-6 text-lg">لم تقم بحجز أي جلسات حتى الآن.</p>
            <Link href="/therapists" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-8 py-4 text-sm font-bold text-white hover:shadow-lg transition-all">
              تصفح الأخصائيين واحجز جلستك الأولى
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="text-xs text-slate-700 bg-slate-50/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-bold rounded-tr-3xl">الأخصائي</th>
                  <th className="px-6 py-4 font-bold">التاريخ والوقت</th>
                  <th className="px-6 py-4 font-bold">نوع الجلسة</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold rounded-tl-3xl">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const isUpcoming = app.scheduledAt > new Date() && (app.status === "PENDING" || app.status === "CONFIRMED");
                  
                  return (
                    <tr key={app.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        د. {app.therapist.name}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <ClientDateTime date={app.scheduledAt} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1">
                          {app.type === "VIDEO" && <><Video className="w-4 h-4 text-indigo-500" /> فيديو</>}
                          {app.type === "AUDIO" && <><Phone className="w-4 h-4 text-emerald-500" /> صوت</>}
                          {app.type === "CHAT" && <><MessageCircle className="w-4 h-4 text-amber-500" /> شات</>}
                          {!app.type && <><Video className="w-4 h-4 text-indigo-500" /> فيديو</>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4">
                        {isUpcoming ? (
                          <div className="flex items-center gap-2">
                            <Link href={`/session/${app.id}`} className="font-semibold text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                              دخول الغرفة
                            </Link>
                            <RescheduleButton appointmentId={app.id} />
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
