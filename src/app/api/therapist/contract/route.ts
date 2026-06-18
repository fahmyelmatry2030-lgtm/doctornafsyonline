import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "THERAPIST" && role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");

  const targetUserId = role === "ADMIN" && therapistId ? therapistId : session.user.id;

  try {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId },
      select: { contractUrl: true }
    });

    return NextResponse.json({ contractUrl: profile?.contractUrl || null });
  } catch {
    return NextResponse.json({ error: "فشل تحميل العقد" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "THERAPIST" && role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let contractUrl: string | null = null;
    let therapistId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      therapistId = (formData.get("therapistId") as string) || null;

      const targetUserId = role === "ADMIN" && therapistId ? therapistId : session.user.id;

      if (!file) {
        return NextResponse.json({ error: "يرجى رفع ملف PDF صالح" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "contracts", targetUserId);
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, buffer);
      contractUrl = `/uploads/contracts/${targetUserId}/${safeName}`;

      const profile = await prisma.therapistProfile.findUnique({ where: { userId: targetUserId } });
      if (!profile) {
        return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
      }

      await prisma.therapistProfile.update({
        where: { userId: targetUserId },
        data: { contractUrl }
      });

      return NextResponse.json({ success: true, contractUrl });
    }

    const body = await request.json();
    contractUrl = body.contractUrl;
    therapistId = body.therapistId;
    const targetUserId = role === "ADMIN" && therapistId ? therapistId : session.user.id;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    await prisma.therapistProfile.update({
      where: { userId: targetUserId },
      data: { contractUrl }
    });

    return NextResponse.json({ success: true, contractUrl });
  } catch (error) {
    console.error("Contract upload error:", error);
    return NextResponse.json({ error: "فشل تحديث العقد" }, { status: 500 });
  }
}
