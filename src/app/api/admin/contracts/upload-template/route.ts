import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content type must be multipart/form-data" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const templateType = formData.get("templateType") as string | null; // trial, marketing, annual

    if (!file || !templateType) {
      return NextResponse.json({ error: "الملف ونوع النموذج مطلوبان" }, { status: 400 });
    }

    if (!["trial", "marketing", "annual"].includes(templateType)) {
      return NextResponse.json({ error: "نوع النموذج غير صالح" }, { status: 400 });
    }

    // Verify file is PDF or image
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "يرجى اختيار ملف PDF أو صورة صالحة للتحميل" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/docs
    const uploadDir = path.join(process.cwd(), "public", "docs");
    await fs.mkdir(uploadDir, { recursive: true });

    let filename = "";
    if (templateType === "trial") {
      filename = "trial_contract_template.pdf";
    } else if (templateType === "marketing") {
      filename = "marketing_consent_template.pdf";
    } else if (templateType === "annual") {
      filename = "annual_contract_template.pdf";
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/docs/${filename}?t=${Date.now()}` 
    });
  } catch (error: any) {
    console.error("Template upload error:", error);
    return NextResponse.json({ error: `فشل رفع النموذج: ${error.message || error}` }, { status: 500 });
  }
}
