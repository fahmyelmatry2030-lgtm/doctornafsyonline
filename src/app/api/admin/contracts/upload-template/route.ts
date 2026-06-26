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
      // Use PDF-specific upload (resource_type: "raw") for public access without auth
      const { uploadPdfToCloudinary } = await import("@/lib/cloudinary");
      fileUrl = await uploadPdfToCloudinary(buffer, "contracts", uniqueFileName);
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

    // Update settings in database — read directly from DB to avoid auth issues in getSettings()
    const { prisma } = await import("@/lib/prisma");

    // Read current saved settings directly from DB
    const dbRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" }
    });
    const currentSaved = dbRecord ? JSON.parse(dbRecord.value) : {};

    // Only update the specific contract URL field, preserve everything else
    const contractField =
      templateType === "trial"    ? "trialContractUrl" :
      templateType === "marketing"? "marketingContractUrl" :
                                    "annualContractUrl";

    const updatedSettings = {
      ...currentSaved,
      [contractField]: fileUrl,
    };

    await prisma.systemSetting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify(updatedSettings) },
      create: { key: "site_settings", value: JSON.stringify(updatedSettings) }
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
