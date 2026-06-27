import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    } as any)
  : null;

/**
 * Generates a checkout session for an appointment payment
 */
export async function createCheckoutSession({
  appointmentId,
  price,
  patientEmail,
  patientName,
  therapistName,
  successUrl,
  cancelUrl,
  currency,
}: {
  appointmentId: string;
  price: number;
  patientEmail?: string;
  patientName: string;
  therapistName: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string | null;
}) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: patientEmail,
    line_items: [
      {
        price_data: {
          currency: (currency || "egp").toLowerCase(),
          product_data: {
            name: `جلسة استشارة نفسية - د. ${therapistName}`,
            description: `حجز موعد للمريض: ${patientName}`,
          },
          unit_amount: price * 100, // Price in cents/piastres
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      appointmentId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
