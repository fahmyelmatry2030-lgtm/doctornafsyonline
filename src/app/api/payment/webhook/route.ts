import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const appointmentId = session.metadata?.appointmentId;

    if (appointmentId) {
      try {
        console.log(`[Stripe Webhook] Payment succeeded for appointment: ${appointmentId}`);

        // Update appointment status to CONFIRMED
        const appointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: "CONFIRMED" },
          include: {
            patient: { select: { name: true, phone: true } },
            therapist: { select: { name: true } },
          },
        });

        // Trigger SMS & WhatsApp notification
        try {
          const { notifyAppointmentConfirmed } = await import("@/lib/notifications");
          const formattedDate = appointment.scheduledAt.toLocaleString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });

          await notifyAppointmentConfirmed({
            patientName: appointment.patient.name,
            patientPhone: appointment.patient.phone,
            therapistName: appointment.therapist.name,
            dateTimeStr: formattedDate,
          });
        } catch (notifErr) {
          console.error("Failed to send WhatsApp confirmation inside webhook:", notifErr);
        }
      } catch (dbErr) {
        console.error("[Stripe Webhook Database Error]:", dbErr);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
