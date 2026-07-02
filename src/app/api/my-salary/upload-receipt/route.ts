import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const recordId = formData.get("recordId") as string;
    const file = formData.get("receipt") as File | null;

    if (!recordId || !file) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const record = await prisma.monthlySalaryRecord.findUnique({
      where: { id: recordId }
    });

    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح أو السجل غير موجود" }, { status: 403 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 8 ميجابايت" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "صيغة غير صالحة. يرجى رفع صورة أو ملف PDF" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop() || "png";
    const fileName = `receipt_${recordId}_${Date.now()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let receiptUrl = "";

    try {
      if (fileExtension.toLowerCase() === "pdf") {
        throw new Error("PDF uploads to Cloudinary are restricted. Forcing local storage.");
      }
      receiptUrl = await uploadToCloudinary(buffer, "receipts", fileName);
    } catch (cloudinaryError) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        receiptUrl = `/uploads/receipts/${fileName}`;
      } catch (localError) {
        console.error("Local file upload failed (likely Vercel Read-Only FS):", localError);
        return NextResponse.json(
          { error: "لا يمكن حفظ الصورة على السيرفر الحالي. يرجى تفعيل Cloudinary لرفع الصور." },
          { status: 500 }
        );
      }
    }

    await prisma.monthlySalaryRecord.update({
      where: { id: recordId },
      data: {
        receiptDocument: receiptUrl,
        status: "ACKNOWLEDGED",
      }
    });

    return NextResponse.json({ success: true, receiptUrl });
  } catch (error: any) {
    console.error("Receipt upload error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع الإقرار" }, { status: 500 });
  }
}
