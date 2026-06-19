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

  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الصورة يجب ألا يتجاوز 5 ميجابايت" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "صيغة الملف غير صالحة. يرجى رفع صورة بصيغة JPG أو PNG أو WEBP" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop() || "png";
    const fileName = `${userId}_avatar.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let avatarUrl = "";

    try {
      // Try to upload to Cloudinary
      avatarUrl = await uploadToCloudinary(buffer, "avatars", fileName);
      console.log("[Avatar Upload] Uploaded successfully to Cloudinary:", avatarUrl);
    } catch (cloudinaryError) {
      console.warn("[Avatar Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      // Save image locally
      await fs.writeFile(filePath, buffer);
      avatarUrl = `/uploads/avatars/${fileName}`;
    }

    // Update User model
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ success: true, avatar: avatarUrl });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء رفع الصورة" }, { status: 500 });
  }
}

