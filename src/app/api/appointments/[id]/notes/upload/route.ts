import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id: appointmentId } = await params;

  // Verify that this therapist owns this appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  if (appointment.therapistId !== session.user.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 10 ميجابايت" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop() || "pdf";
    const fileName = `note_${appointmentId}_${Date.now()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    try {
      if (fileExtension.toLowerCase() === "pdf") {
        throw new Error("PDF uploads to Cloudinary are restricted. Forcing local storage.");
      }
      // Try Cloudinary upload if available
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      fileUrl = await uploadToCloudinary(buffer, "notes", fileName);
      console.log("[Note Attachment Upload] Uploaded successfully to Cloudinary:", fileUrl);
    } catch (cloudinaryError) {
      console.warn("[Note Attachment Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "notes");
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      try { await fs.chmod(uploadDir, 0o755); } catch (e) {}

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      try { await fs.chmod(filePath, 0o644); } catch (e) {}
      fileUrl = `/uploads/notes/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      name: file.name,
    });
  } catch (error: any) {
    console.error("Note attachment upload error:", error);
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
