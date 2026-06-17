import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, name: true, isSuspended: true, createdAt: true }
    });
    return NextResponse.json({ adminCount: admins.length, admins });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secretKey, action, email, password } = body;

    if (secretKey !== "nafsi-admin-setup-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "verify") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "User not found" });
      const valid = await bcrypt.compare(password, user.password);
      return NextResponse.json({ found: true, role: user.role, isSuspended: user.isSuspended, passwordValid: valid });
    }

    if (action === "reset-password") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "User not found" });
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { email }, data: { password: hashedPassword, isSuspended: false } });
      return NextResponse.json({ success: true, message: "Password reset successfully!" });
    }

    if (action === "create") {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Already exists", role: existing.role });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newAdmin = await prisma.user.create({
        data: { name: "مدير النظام", email, password: hashedPassword, role: "ADMIN", phone: "0000000000" }
      });
      return NextResponse.json({ success: true, admin: { id: newAdmin.id, email: newAdmin.email } });
    }

    return NextResponse.json({ error: "Unknown action" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
