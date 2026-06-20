import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, createCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { appointmentId } = await request.json();
    if (!appointmentId) {
      return NextResponse.json({ error: "معرف الجلسة مطلوب" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        therapist: { select: { name: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
    }

    if (appointment.patientId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح لك بدفع هذه الجلسة" }, { status: 403 });
    }

    if (appointment.status === "CONFIRMED") {
      return NextResponse.json({ error: "هذه الجلسة مؤكدة ومدفوعة بالفعل" }, { status: 400 });
    }

    if (!stripe) {
      // In development or if Stripe is not configured, redirect to billing indicating Stripe is unavailable
      console.log("[Stripe Mock] Stripe credentials missing. Redirecting to manual transfer request.");
      return NextResponse.json({ url: "/patient/billing?status=mock_stripe_unavailable" });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      appointmentId,
      price: appointment.price,
      patientEmail: appointment.patient.email,
      patientName: appointment.patient.name,
      therapistName: appointment.therapist.name,
      successUrl: `${baseUrl}/patient/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/patient/billing?status=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تهيئة عملية الدفع الإلكتروني" },
      { status: 500 }
    );
  }
}
