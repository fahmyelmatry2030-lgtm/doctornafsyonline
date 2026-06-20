import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const resolvedParams = await params;
  const appointmentId = resolvedParams.id;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
    }

    // Verify ownership
    if (appointment.patientId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح لك بتعديل هذا الحجز" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف" }, { status: 400 });
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

    const fileExtension = file.name.split(".").pop() || "png";
    const fileName = `appt_${appointmentId}_screenshot_${Date.now()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let screenshotUrl = "";

    try {
      // Try Cloudinary upload
      screenshotUrl = await uploadToCloudinary(buffer, "screenshots", fileName);
      console.log("[Screenshot Upload] Uploaded successfully to Cloudinary:", screenshotUrl);
    } catch (cloudinaryError) {
      console.warn("[Screenshot Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "screenshots");
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      try { await fs.chmod(uploadDir, 0o755); } catch (e) {}

      const filePath = path.join(uploadDir, fileName);
      // Save locally
      await fs.writeFile(filePath, buffer);
      try { await fs.chmod(filePath, 0o644); } catch (e) {}
      screenshotUrl = `/uploads/screenshots/${fileName}`;
    }

    // Update appointment
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentScreenshot: screenshotUrl,
        status: "PENDING", // Enforce pending status while awaiting admin review
      },
    });

    return NextResponse.json({ success: true, screenshotUrl });
  } catch (error: any) {
    console.error("Screenshot upload error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع لقطة الشاشة" }, { status: 500 });
  }
}

