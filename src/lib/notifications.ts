import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromSMS = process.env.TWILIO_PHONE_NUMBER;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Twilio Sandbox default

let client: any = null;

if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
  }
}

/**
 * Format phone number to E.164 format (e.g. +201012345678)
 */
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  // If it starts with 0 and is an Egyptian mobile (11 digits or 10 digits starting with 1)
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "2" + cleaned; // Egypt country code
  }
  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export async function sendSMS(to: string, message: string) {
  const formattedTo = formatPhoneNumber(to);
  console.log(`[SMS SENDING] To: ${formattedTo} | Message: ${message}`);

  if (!client || !fromSMS) {
    console.log("[SMS FALLBACK] Twilio credentials not configured. SMS not sent to network.");
    return { success: true, fallback: true };
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: fromSMS,
      to: formattedTo,
    });
    return { success: true, sid: res.sid };
  } catch (error) {
    console.error("Twilio SMS send error:", error);
    return { success: false, error };
  }
}

export async function sendWhatsApp(to: string, message: string) {
  const formattedTo = formatPhoneNumber(to);
  console.log(`[WhatsApp SENDING] To: ${formattedTo} | Message: ${message}`);

  if (!client || !fromWhatsApp) {
    console.log("[WhatsApp FALLBACK] Twilio credentials not configured. WhatsApp not sent to network.");
    return { success: true, fallback: true };
  }

  try {
    // Twilio WhatsApp recipient must start with "whatsapp:" prefix
    const formattedToWhatsApp = formattedTo.startsWith("whatsapp:") ? formattedTo : `whatsapp:${formattedTo}`;
    const formattedFromWhatsApp = fromWhatsApp.startsWith("whatsapp:") ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;

    const res = await client.messages.create({
      body: message,
      from: formattedFromWhatsApp,
      to: formattedToWhatsApp,
    });
    return { success: true, sid: res.sid };
  } catch (error) {
    console.error("Twilio WhatsApp send error:", error);
    return { success: false, error };
  }
}

// Higher-level notification functions for Nafsi Platform

export async function notifyNewAppointment({
  patientName,
  patientPhone,
  therapistName,
  therapistPhone,
  dateTimeStr,
  price,
}: {
  patientName: string;
  patientPhone?: string | null;
  therapistName: string;
  therapistPhone?: string | null;
  dateTimeStr: string;
  price: number;
}) {
  // 1. Notify Therapist about the booked session
  if (therapistPhone) {
    const msg = `مرحباً د. ${therapistName}، تم حجز جلسة جديدة معك من قبل المريض ${patientName} بتاريخ ${dateTimeStr}. يرجى التحقق من لوحة التحكم الخاصة بك لمتابعة الجلسة. منصة نفسي.`;
    await sendWhatsApp(therapistPhone, msg);
  }

  // 2. Notify Patient confirming the booking and instructing payment
  if (patientPhone) {
    const msg = `مرحباً ${patientName}، تم حجز جلستك مع د. ${therapistName} بنجاح بتاريخ ${dateTimeStr}. قيمة الجلسة ${price} ج.م. يرجى إتمام التحويل عبر InstaPay أو فودافون كاش ورفع لقطة الشاشة في قسم الفواتير لتأكيد الحجز. منصة نفسي.`;
    await sendSMS(patientPhone, msg);
    await sendWhatsApp(patientPhone, msg);
  }
}

export async function notifyAppointmentConfirmed({
  patientName,
  patientPhone,
  therapistName,
  dateTimeStr,
}: {
  patientName: string;
  patientPhone?: string | null;
  therapistName: string;
  dateTimeStr: string;
}) {
  if (patientPhone) {
    const msg = `مرحباً ${patientName}، تم التحقق من عملية التحويل المالي وتأكيد جلستك مع د. ${therapistName} بتاريخ ${dateTimeStr} بنجاح. يمكنك الدخول إلى المنصة في الموعد المحدد لبدء الجلسة. منصة نفسي.`;
    await sendSMS(patientPhone, msg);
    await sendWhatsApp(patientPhone, msg);
  }
}
