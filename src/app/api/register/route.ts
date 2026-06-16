import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

import { getSettings } from "@/app/admin/settings/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, email, password, phone, role,
      specializations, yearsExperience, pricePerSession 
    } = body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
      specializations?: string;
      yearsExperience?: string;
      pricePerSession?: string;
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
    const userRole = role === "THERAPIST" ? "THERAPIST" : "PATIENT";

    // التحقق من إعدادات المنصة
    const settings = await getSettings();
    if (userRole === "THERAPIST" && !settings.allowNewTherapists) {
      return NextResponse.json(
        { error: "تسجيل الأخصائيين الجدد معطل حالياً من قبل الإدارة" },
        { status: 400 }
      );
    }
    if (userRole === "PATIENT" && !settings.allowNewPatients) {
      return NextResponse.json(
        { error: "تسجيل المرضى الجدد معطل حالياً من قبل الإدارة" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
        ...(userRole === "THERAPIST" && {
          therapistProfile: {
            create: {
              bio: "أخصائي نفسي جديد",
              specializations: specializations ? JSON.stringify(specializations.split(',').map(s => s.trim())) : JSON.stringify(["استشارات عامة"]),
              pricePerSession: pricePerSession ? Number(pricePerSession) : 300,
              yearsExperience: yearsExperience ? Number(yearsExperience) : 1,
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التسجيل" },
      { status: 500 }
    );
  }
}
