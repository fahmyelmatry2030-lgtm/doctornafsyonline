import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// Local storage upload route for demo/offline uploads
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id: appointmentId } = await params;

  // Verify appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return NextResponse.json({ error: "الجلسة غير موجودة" }, { status: 404 });
  }

  const isParticipant =
    appointment.patientId === session.user.id ||
    appointment.therapistId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لا يوجد ملف مرفوع" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a local uploads folder
    const uploadDir = path.join(process.cwd(), "public/uploads", appointmentId);
    await fs.mkdir(uploadDir, { recursive: true });
    try { await fs.chmod(uploadDir, 0o755); } catch (e) {}

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, buffer);
    try { await fs.chmod(filePath, 0o644); } catch (e) {}

    const fileUrl = `/uploads/${appointmentId}/${safeFileName}`;

    // Create the chat file attachment message automatically
    const fileMsg = await prisma.message.create({
      data: {
        appointmentId,
        senderId: session.user.id,
        content: `أرسل ملفاً: ${file.name}`,
        fileUrl,
        fileName: file.name,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json(fileMsg, { status: 201 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
