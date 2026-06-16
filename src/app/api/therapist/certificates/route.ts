import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: { certificates: true }
  });

  const certificates = profile?.certificates ? JSON.parse(profile.certificates) : [];
  return NextResponse.json(certificates);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { name, url } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "اسم الشهادة مطلوب" }, { status: 400 });
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    const currentCerts = profile.certificates ? JSON.parse(profile.certificates) : [];
    
    const newCert = {
      id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      url: url || "/mock-docs/certificate_placeholder.pdf",
      uploadedAt: new Date().toISOString(),
      status: "PENDING" // PENDING, APPROVED, REJECTED
    };

    const updatedCerts = [...currentCerts, newCert];

    await prisma.therapistProfile.update({
      where: { userId: session.user.id },
      data: { certificates: JSON.stringify(updatedCerts) }
    });

    return NextResponse.json(newCert, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل إضافة الشهادة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف الشهادة مطلوب" }, { status: 400 });
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    const currentCerts = profile.certificates ? JSON.parse(profile.certificates) : [];
    const updatedCerts = currentCerts.filter((c: any) => c.id !== id);

    await prisma.therapistProfile.update({
      where: { userId: session.user.id },
      data: { certificates: JSON.stringify(updatedCerts) }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "فشل حذف الشهادة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { bio, specializations, languages, yearsExperience, pricePerSession } = await request.json();

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      // Create profile if it doesn't exist (onboarding flow)
      await prisma.therapistProfile.create({
        data: {
          userId: session.user.id,
          bio: bio || "",
          specializations: specializations || "",
          languages: languages || "العربية",
          yearsExperience: yearsExperience || 1,
          pricePerSession: pricePerSession || 200,
        }
      });
    } else {
      // Update existing profile
      await prisma.therapistProfile.update({
        where: { userId: session.user.id },
        data: {
          ...(bio !== undefined && { bio }),
          ...(specializations !== undefined && { specializations }),
          ...(languages !== undefined && { languages }),
          ...(yearsExperience !== undefined && { yearsExperience }),
          ...(pricePerSession !== undefined && { pricePerSession }),
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "فشل تحديث الملف الشخصي" }, { status: 500 });
  }
}
