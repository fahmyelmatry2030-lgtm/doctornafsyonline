import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// TEMPORARY diagnostic endpoint - DELETE AFTER USE
export async function GET() {
  try {
    // Find all admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        isSuspended: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      adminCount: admins.length,
      admins,
      message: admins.length === 0 ? "No admin found! Use POST to create one." : "Admin users found.",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secretKey, action, email, password } = body;

    // Simple protection
    if (secretKey !== "nafsi-admin-setup-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "create") {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "User already exists", user: { email: existing.email, role: existing.role } });
      }

      const hashedPassword = await bcrypt.hash(password || "Doctor1346790", 12);
      const newAdmin = await prisma.user.create({
        data: {
          name: "مدير النظام",
          email: email || "admin@nafsi.com",
          password: hashedPassword,
          role: "ADMIN",
          phone: "0000000000",
        }
      });

      return NextResponse.json({
        success: true,
        message: "Admin created!",
        admin: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role }
      });
    }

    if (action === "verify") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "User not found" });
      }

      const valid = await bcrypt.compare(password, user.password);
      return NextResponse.json({
        found: true,
        role: user.role,
        isSuspended: user.isSuspended,
        passwordValid: valid,
        message: valid ? "✅ Password correct!" : "❌ Wrong password!",
      });
    }

    if (action === "reset-password") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, isSuspended: false }
      });

      return NextResponse.json({
        success: true,
        message: "Password reset successfully!",
      });
    }

    return NextResponse.json({ error: "Unknown action" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
