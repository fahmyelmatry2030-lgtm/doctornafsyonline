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

    let fileUrl = "";
    const fileExtension = file.name.split(".").pop() || "pdf";
    const uniqueFileName = `${templateType}_contract_${Date.now()}.${fileExtension}`;

    try {
      // Try Cloudinary upload
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      fileUrl = await uploadToCloudinary(buffer, "contracts", uniqueFileName);
    } catch (cloudinaryError) {
      console.warn("[Contract Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
      
      const uploadDir = path.join(process.cwd(), "public", "docs");
      await fs.mkdir(uploadDir, { recursive: true });
      try { await fs.chmod(uploadDir, 0o755); } catch(e){}

      const filePath = path.join(uploadDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);
      try { await fs.chmod(filePath, 0o644); } catch(e){}
      
      fileUrl = `/docs/${uniqueFileName}`;
    }

    // Update settings in database
    const { prisma } = await import("@/lib/prisma");
    const { getSettings } = await import("@/app/[locale]/admin/settings/actions");
    const currentSettings = await getSettings();
    
    if (templateType === "trial") {
      currentSettings.trialContractUrl = fileUrl;
    } else if (templateType === "marketing") {
      currentSettings.marketingContractUrl = fileUrl;
    } else if (templateType === "annual") {
      currentSettings.annualContractUrl = fileUrl;
    }

    // Strip out secrets before saving (similar to actions.ts)
    const { stripeKey, livekitKey, livekitUrl, ...savableSettings } = currentSettings;

    await prisma.systemSetting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify(savableSettings) },
      create: { key: "site_settings", value: JSON.stringify(savableSettings) }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ 
      success: true, 
      url: fileUrl 
    });
  } catch (error: any) {
    console.error("Template upload error:", error);
    return NextResponse.json({ error: `فشل رفع النموذج: ${error.message || error}` }, { status: 500 });
  }
}
