import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id: appointmentId } = await params;

  // Verify participation
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
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

  const note = await prisma.sessionNote.findUnique({
    where: { appointmentId }
  });

  return NextResponse.json(note || { notes: "" });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id: appointmentId } = await params;
  const { notes } = await request.json();

  if (typeof notes !== "string") {
    return NextResponse.json({ error: "التقرير الطبي يجب أن يكون نصاً" }, { status: 400 });
  }

  // Verify that this therapist owns this appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  if (appointment.therapistId !== session.user.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const note = await prisma.sessionNote.upsert({
      where: { appointmentId },
      update: { notes },
      create: {
        appointmentId,
        therapistId: session.user.id,
        notes,
      }
    });

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: "فشل حفظ التقرير الطبي" }, { status: 500 });
  }
}
