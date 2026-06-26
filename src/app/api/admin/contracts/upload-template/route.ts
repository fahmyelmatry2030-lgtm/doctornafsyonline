import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const templateType = formData.get("templateType") as string | null;

    if (!file || !templateType) {
      return NextResponse.json({ error: "الملف ونوع النموذج مطلوبان" }, { status: 400 });
    }

    if (!["trial", "marketing", "annual"].includes(templateType)) {
      return NextResponse.json({ error: "نوع النموذج غير صالح" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "يرجى اختيار ملف PDF فقط" }, { status: 400 });
    }

    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 15 ميجابايت" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    try {
      // Upload PDF to Cloudinary as "raw" resource type for public access
      const { uploadPdfToCloudinary } = await import("@/lib/cloudinary");
      const fileName = `${templateType}_contract_${Date.now()}`;
      fileUrl = await uploadPdfToCloudinary(buffer, "contracts", fileName);
      console.log(`[Contract Upload] Uploaded ${templateType} contract to Cloudinary:`, fileUrl);
    } catch (cloudinaryError) {
      console.error("[Contract Upload] Cloudinary failed:", cloudinaryError);
      return NextResponse.json({ 
        error: "فشل رفع الملف. تأكد من إعدادات Cloudinary في لوحة Vercel." 
      }, { status: 500 });
    }

    // Save the Cloudinary URL in site_settings
    const contractField =
      templateType === "trial"     ? "trialContractUrl" :
      templateType === "marketing" ? "marketingContractUrl" :
                                     "annualContractUrl";

    const dbRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" },
    });
    const currentSaved = dbRecord ? JSON.parse(dbRecord.value) : {};

    const updatedSettings = {
      ...currentSaved,
      [contractField]: fileUrl,
    };

    await prisma.systemSetting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify(updatedSettings) },
      create: { key: "site_settings", value: JSON.stringify(updatedSettings) },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Template upload error:", error);
    return NextResponse.json({ error: `فشل رفع النموذج: ${error.message || error}` }, { status: 500 });
  }
}
