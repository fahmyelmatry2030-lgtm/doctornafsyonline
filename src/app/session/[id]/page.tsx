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

  const otherParticipantName =
    session.user.id === appointment.patientId
      ? appointment.therapist.name
      : appointment.patient.name;

  let token: string | null = null;
  if (isLiveKitConfigured()) {
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

  const isTherapist = session.user.role === "THERAPIST";

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
        livekitUrl={process.env.LIVEKIT_URL || null}
        livekitConfigured={isLiveKitConfigured()}
        currentUserId={session.user.id}
        currentUserName={session.user.name || ""}
        otherParticipantName={otherParticipantName}
        isTherapist={isTherapist}
      />
    </div>
  );
}
