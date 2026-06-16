import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id: patientId } = await params;

  try {
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, email: true, phone: true }
    });

    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    // Fetch all appointments between this therapist and the patient
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        therapistId: session.user.id
      },
      include: {
        sessionNote: true
      },
      orderBy: {
        scheduledAt: "desc"
      }
    });

    return NextResponse.json({
      patient,
      appointments
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء تحميل بيانات المريض" }, { status: 500 });
  }
}
