import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

function generateResetToken(userId: string, email: string, currentPasswordHash: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour expiration
  const payload = Buffer.from(JSON.stringify({ userId, email, expiresAt })).toString("base64url");
  const secret = (process.env.NEXTAUTH_SECRET || "default_secret") + currentPasswordHash;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success even if user not found to prevent user enumeration
      return NextResponse.json({ success: true });
    }

    const token = generateResetToken(user.id, user.email, user.password);
    
    // Construct reset link
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://doctornafsyonline.com";
    const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    console.log(`[PASSWORD RESET LINK]: ${resetLink}`);

    // SMTP Mail Setup
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || "Nafsi Platform <no-reply@doctornafsyonline.com>";

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: smtpFrom,
        to: user.email,
        subject: "إعادة تعيين كلمة المرور - منصة نفسي",
        html: `
          <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: right;">
            <h2 style="color: #6366F1; text-align: center;">منصة نفسي للعلاج النفسي</h2>
            <p>مرحباً ${user.name}،</p>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على منصة نفسي.</p>
            <p>يرجى الضغط على الزر أدناه لإعادة تعيين كلمة المرور (هذا الرابط صالح لمدة ساعة واحدة فقط):</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">إعادة تعيين كلمة المرور</a>
            </div>
            <p>إذا لم تكن قد طلبت إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999; text-align: center;">هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SMTP Email Sent] Reset link sent to ${user.email}`);
    } else {
      console.log("[SMTP Email Skip] SMTP credentials not fully configured in env variables.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب" }, { status: 500 });
  }
}
