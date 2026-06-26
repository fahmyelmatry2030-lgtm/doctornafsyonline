import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLiveKitToken, isLiveKitConfigured } from "@/lib/livekit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true } },
      therapist: { select: { id: true, name: true } },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  const isParticipant =
    appointment.patientId === session.user.id ||
    appointment.therapistId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  let token: string | null = null;
  if (isLiveKitConfigured()) {
    token = await createLiveKitToken(
      appointment.roomName,
      session.user.name || "مستخدم",
      session.user.id
    );
  }

  return NextResponse.json({
    appointment,
    livekit: {
      token,
      url: process.env.LIVEKIT_URL,
      configured: isLiveKitConfigured(),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const { status, scheduledAt } = await request.json();

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  const isParticipant =
    appointment.patientId === session.user.id ||
    appointment.therapistId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const updateData: any = {};
  
  if (status) {
    // Role-based status validation
    const role = session.user.role;
    
    // Patients cannot confirm appointments or mark them completed/cancelled by therapist
    if (role === "PATIENT" && ["CONFIRMED", "COMPLETED", "CANCELLED_BY_THERAPIST"].includes(status)) {
       return NextResponse.json({ error: "غير مصرح لك بتغيير الحالة إلى هذه القيمة" }, { status: 403 });
    }

    // Therapists shouldn't normally change to CANCELLED_BY_PATIENT
    if (role === "THERAPIST" && ["CANCELLED_BY_PATIENT"].includes(status)) {
       return NextResponse.json({ error: "غير مصرح لك بتغيير الحالة إلى هذه القيمة" }, { status: 403 });
    }

    updateData.status = status;
  }
  
  if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
