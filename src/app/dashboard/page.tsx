import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/constants";
import { Calendar, Video, Phone, MessageCircle, ArrowLeft } from "lucide-react";

const TYPE_ICONS = {
  VIDEO: Video,
  AUDIO: Phone,
  CHAT: MessageCircle,
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "مؤكدة", color: "bg-teal-100 text-teal-700" },
  IN_PROGRESS: { label: "جارية", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "مكتملة", color: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "ملغية", color: "bg-red-100 text-red-600" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isTherapist = session.user.role === "THERAPIST";

  const appointments = await prisma.appointment.findMany({
    where: isTherapist
      ? { therapistId: session.user.id }
      : { patientId: session.user.id },
    include: {
      patient: { select: { name: true } },
      therapist: { select: { name: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"
  );
  const past = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED"
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          مرحباً، {session.user.name}
        </h1>
        <p className="mt-2 text-slate-600">
          {isTherapist ? "لوحة تحكم الأخصائي" : "جلساتك ومواعيدك"}
        </p>
      </div>

      {!isTherapist && (
        <Link
          href="/therapists"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
        >
          احجز جلسة جديدة
        </Link>
      )}

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
          <Calendar className="h-5 w-5 text-teal-600" />
          الجلسات القادمة
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            لا توجد جلسات قادمة
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((apt) => {
              const TypeIcon = TYPE_ICONS[apt.type];
              const status = STATUS_LABELS[apt.status];
              const otherName = isTherapist
                ? apt.patient.name
                : apt.therapist.name;

              return (
                <div
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-teal-600" />
                      <span className="font-bold text-slate-800">
                        {otherName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatDate(new Date(apt.scheduledAt))}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatPrice(apt.price)} — {apt.duration} دقيقة
                    </p>
                  </div>
                  <Link
                    href={`/session/${apt.id}`}
                    className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
                  >
                    ادخل الجلسة
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            الجلسات السابقة
          </h2>
          <div className="space-y-3">
            {past.map((apt) => {
              const otherName = isTherapist
                ? apt.patient.name
                : apt.therapist.name;
              const status = STATUS_LABELS[apt.status];

              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-5 py-4 opacity-75"
                >
                  <div>
                    <span className="font-medium text-slate-700">
                      {otherName}
                    </span>
                    <p className="text-sm text-slate-400">
                      {formatDate(new Date(apt.scheduledAt))}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
