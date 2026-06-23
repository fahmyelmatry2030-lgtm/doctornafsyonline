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
    const { therapistId, scheduledAt, type, duration, promoCode } = await request.json();

    if (!scheduledAt) {
      return NextResponse.json({ error: "الرجاء تحديد موعد وتاريخ الجلسة بشكل صحيح." }, { status: 400 });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "صيغة التاريخ غير صحيحة، يرجى التأكد من تحديد الموعد." }, { status: 400 });
    }

    // Prevent booking in the past
    if (parsedDate.getTime() < Date.now()) {
      return NextResponse.json({ error: "عفواً، لا يمكن حجز موعد بأثر رجعي. يرجى اختيار موعد متاح في المستقبل." }, { status: 400 });
    }

    const therapist = await prisma.user.findUnique({
      where: { id: therapistId, role: "THERAPIST" },
      include: { therapistProfile: true },
    });

    if (!therapist?.therapistProfile) {
      return NextResponse.json({ error: "الأخصائي غير موجود" }, { status: 404 });
    }

    // Validate and apply promo code if provided
    let discountPercent = 0;
    if (promoCode?.trim()) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: {
            equals: promoCode.trim(),
          },
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      if (promo) {
        discountPercent = promo.discount;
      }
    }

    const originalPrice = therapist.therapistProfile.pricePerSession;
    const finalPrice = Math.max(0, Math.round(originalPrice * (1 - discountPercent / 100)));

    const roomName = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const patientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true }
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        therapistId,
        scheduledAt: parsedDate,
        type: type || "VIDEO",
        duration: duration || 50,
        price: finalPrice,
        roomName,
        status: "PENDING",
      },
    });

    try {
      const { notifyNewAppointment } = await import("@/lib/notifications");
      const formattedDate = parsedDate.toLocaleString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      await notifyNewAppointment({
        patientName: patientUser?.name || "مريض نفسي",
        patientPhone: patientUser?.phone,
        therapistName: therapist.name,
        therapistPhone: therapist.phone,
        dateTimeStr: formattedDate,
        price: appointment.price,
      });
    } catch (notifErr) {
      console.error("Failed to send booking notifications:", notifErr);
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Booking error details:", error);
    return NextResponse.json({ error: `فشل الحجز: ${error.message || error}` }, { status: 500 });
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
