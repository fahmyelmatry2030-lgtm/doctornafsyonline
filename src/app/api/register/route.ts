import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: Role;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل مسبقاً" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === "THERAPIST" ? Role.THERAPIST : Role.PATIENT;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
        ...(userRole === Role.THERAPIST && {
          therapistProfile: {
            create: {
              bio: "أخصائي نفسي معتمد",
              specializations: JSON.stringify(["القلق والتوتر"]),
              pricePerSession: 300,
              yearsExperience: 3,
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء التسجيل" },
      { status: 500 }
    );
  }
}
