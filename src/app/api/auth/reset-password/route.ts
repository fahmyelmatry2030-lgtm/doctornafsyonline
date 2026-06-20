import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function verifyResetToken(token: string, currentPasswordHash: string): { userId: string; email: string } | null {
  try {
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;
    
    const secret = (process.env.NEXTAUTH_SECRET || "default_secret") + currentPasswordHash;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payloadStr).digest("base64url");
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));
    if (payload.expiresAt < Date.now()) return null; // Expired
    
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const verified = verifyResetToken(token, user.password);
    if (!verified || verified.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية" }, { status: 400 });
    }

    // Password strength check
    const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (newPassword.length < 8 || !hasLetter || !hasNumber) {
      return NextResponse.json({ error: "يجب أن تتكون كلمة المرور من 8 خانات على الأقل، وتحتوي على حرف ورقم واحد على الأقل" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" }, { status: 500 });
  }
}
