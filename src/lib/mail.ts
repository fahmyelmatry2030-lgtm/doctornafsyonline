import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"منصة نفسي" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, info };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
