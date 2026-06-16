import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLiveKitToken } from "@/lib/livekit";


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { therapistId, scheduledAt, type, duration } = await request.json();

    const therapist = await prisma.user.findUnique({
      where: { id: therapistId, role: "THERAPIST" },
      include: { therapistProfile: true },
    });

    if (!therapist?.therapistProfile) {
      return NextResponse.json({ error: "الأخصائي غير موجود" }, { status: 404 });
    }

    const roomName = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        therapistId,
        scheduledAt: new Date(scheduledAt),
        type: type || "VIDEO",
        duration: duration || 50,
        price: therapist.therapistProfile.pricePerSession,
        roomName,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل الحجز" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const isTherapist = session.user.role === "THERAPIST";

  const appointments = await prisma.appointment.findMany({
    where: isTherapist
      ? { therapistId: session.user.id }
      : { patientId: session.user.id },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      therapist: {
        select: {
          id: true,
          name: true,
          email: true,
          therapistProfile: true,
        },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json(appointments);
}
