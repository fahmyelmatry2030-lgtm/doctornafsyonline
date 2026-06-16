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

  const { id } = await params;

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

  const messages = await prisma.message.findMany({
    where: { appointmentId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
  }

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

  const message = await prisma.message.create({
    data: {
      appointmentId: id,
      senderId: session.user.id,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
