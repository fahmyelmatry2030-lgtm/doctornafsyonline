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
    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const file = formData.get("file") as File | null;

    if (!name?.trim()) {
      return NextResponse.json({ error: "اسم الشهادة مطلوب" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "ملف الشهادة مطلوب" }, { status: 400 });
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 8 ميجابايت" }, { status: 400 });
    }

    // Validate type (Images and PDF allowed)
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "صيغة غير صالحة. يرجى رفع صورة أو ملف PDF" }, { status: 400 });
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    const fileExtension = file.name.split(".").pop() || "pdf";
    const fileName = `cert_${session.user.id}_${Date.now()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    try {
      // Try Cloudinary upload
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      fileUrl = await uploadToCloudinary(buffer, "certificates", fileName);
      console.log("[Certificate Upload] Uploaded successfully to Cloudinary:", fileUrl);
    } catch (cloudinaryError) {
      console.warn("[Certificate Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
      
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads", "certificates");
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      // Save locally
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/certificates/${fileName}`;
    }

    const currentCerts = profile.certificates ? JSON.parse(profile.certificates) : [];
    
    const newCert = {
      id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
      status: "PENDING" // PENDING, APPROVED, REJECTED
    };

    const updatedCerts = [...currentCerts, newCert];

    await prisma.therapistProfile.update({
      where: { userId: session.user.id },
      data: { certificates: JSON.stringify(updatedCerts) }
    });

    return NextResponse.json(newCert, { status: 201 });
  } catch (error: any) {
    console.error("Certificate upload error:", error);
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
