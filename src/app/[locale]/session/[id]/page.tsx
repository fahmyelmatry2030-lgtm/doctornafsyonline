import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { SessionRoom } from "@/components/SessionRoom";
import { createLiveKitToken, isLiveKitConfigured } from "@/lib/livekit";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SessionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true } },
      therapist: { select: { id: true, name: true } },
    },
  });

  if (!appointment) notFound();

  const isParticipant =
    appointment.patientId === session.user.id ||
    appointment.therapistId === session.user.id;

  if (!isParticipant) redirect("/dashboard");

  // Restrict session entry based on status
  const isTherapist = session.user.role === "THERAPIST";

  if (appointment.status === "PENDING") {
    const hasScreenshot = !!appointment.paymentScreenshot;
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" dir="rtl">
        <div className="glass rounded-[32px] border border-amber-200 bg-amber-50/50 p-8 space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-amber-800">الجلسة قيد الانتظار</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            {hasScreenshot 
              ? "تم رفع إثبات التحويل المالي بنجاح وهو قيد المراجعة والاعتماد حالياً من قبل إدارة المنصة. سيتم تفعيل رابط دخول الجلسة فور اعتماد الإدارة." 
              : "يرجى إتمام عملية التحويل المالي أولاً ورفع لقطة الشاشة (Screenshot) كإثبات دفع في صفحة الفواتير لتتمكن من دخول الجلسة."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
            >
              العودة للوحة التحكم
            </Link>
            {!hasScreenshot && (
              <Link
                href="/patient/billing"
                className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
              >
                صفحة الفواتير والدفع
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (appointment.status === "CANCELLED") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" dir="rtl">
        <div className="glass rounded-[32px] border border-red-200 bg-red-50/50 p-8 space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-red-800">تم إلغاء الجلسة</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            تم إلغاء حجز هذه الجلسة مسبقاً. إذا كان لديك أي استفسار، يرجى التواصل مع الدعم الفني للمنصة.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (appointment.status === "COMPLETED") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" dir="rtl">
        <div className="glass rounded-[32px] border border-green-200 bg-green-50/50 p-8 space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-green-800">اكتملت الجلسة العلاجية</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            تم إنهاء هذه الجلسة واكتمالها بنجاح. شكراً لكم. نتمنى لكم دوام الصحة والعافية.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipantName =
    session.user.id === appointment.patientId
      ? appointment.therapist.name
      : appointment.patient.name;

  const isConfigured = await isLiveKitConfigured();
  
  let token: string | null = null;
  let lkUrl: string | null = null;
  
  if (isConfigured) {
    const settings = await import("@/app/[locale]/admin/settings/actions").then(m => m.getSettings());
    lkUrl = settings.livekitUrl || process.env.LIVEKIT_URL || null;
    token = await createLiveKitToken(
      appointment.roomName,
      session.user.name || "مستخدم",
      session.user.id
    );
  }

  if (appointment.status === "CONFIRMED") {
    await prisma.appointment.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });
  }

  
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للوحة التحكم
      </Link>

      <SessionRoom
        appointmentId={appointment.id}
        sessionType={appointment.type as "VIDEO" | "AUDIO" | "CHAT"}
        livekitToken={token}
        livekitUrl={lkUrl}
        livekitConfigured={isConfigured}
        currentUserId={session.user.id}
        currentUserName={session.user.name || ""}
        otherParticipantName={otherParticipantName}
        isTherapist={isTherapist}
        scheduledAt={appointment.scheduledAt.toISOString()}
        duration={appointment.duration}
      />
    </div>
  );
}
