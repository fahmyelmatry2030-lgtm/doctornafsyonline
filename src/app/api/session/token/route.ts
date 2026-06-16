import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLiveKitToken } from "@/lib/livekit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const appointmentId = searchParams.get("appointmentId");

  if (!appointmentId) {
    return NextResponse.json({ error: "معرف الجلسة مفقود" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  if (appointment.patientId !== userId && appointment.therapistId !== userId) {
    return NextResponse.json({ error: "غير مصرح لك بدخول هذه الجلسة" }, { status: 403 });
  }

  const token = await createLiveKitToken(
    appointment.roomName,
    session.user?.name || "مستخدم",
    userId
  );

  if (!token) {
    return NextResponse.json({ error: "خطأ في توليد التوكن أو إعدادات LiveKit غير مكتملة" }, { status: 500 });
  }

  return NextResponse.json({ token, roomName: appointment.roomName });
}
