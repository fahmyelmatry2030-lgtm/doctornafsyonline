import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح - لم يتم تسجيل الدخول" }, { status: 401 });
  }

  const role = (session.user.role || "").toUpperCase();
  if (!role.includes("ADMIN")) {
    return NextResponse.json({ error: `غير مصرح - دورك: ${session.user.role}` }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const templateType = formData.get("templateType") as string | null;

    if (!file || !templateType) {
      return NextResponse.json({ error: "الملف ونوع النموذج مطلوبان" }, { status: 400 });
    }

    if (!["trial", "marketing", "annual"].includes(templateType)) {
      return NextResponse.json({ error: "نوع النموذج غير صالح" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 10 ميجابايت" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    // Try Cloudinary first
    try {
      const { uploadPdfToCloudinary } = await import("@/lib/cloudinary");
      const fileName = `${templateType}_contract_${Date.now()}`;
      fileUrl = await uploadPdfToCloudinary(buffer, "contracts", fileName);
      console.log("[Contract] Uploaded to Cloudinary:", fileUrl);
    } catch (cloudErr: any) {
      console.warn("[Contract] Cloudinary failed, saving to DB:", cloudErr.message);
      
      // Fallback: save to DB as base64
      const base64 = buffer.toString("base64");
      const dbKey = `contract_pdf_${templateType}`;
      await prisma.systemSetting.upsert({
        where: { key: dbKey },
        update: { value: base64 },
        create: { key: dbKey, value: base64 },
      });
      fileUrl = `/api/contracts/${templateType}`;
    }

    // Save URL in site_settings
    const contractField =
      templateType === "trial"     ? "trialContractUrl" :
      templateType === "marketing" ? "marketingContractUrl" :
                                     "annualContractUrl";

    const dbRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" },
    });
    const currentSaved = dbRecord ? JSON.parse(dbRecord.value) : {};

    await prisma.systemSetting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify({ ...currentSaved, [contractField]: fileUrl }) },
      create: { key: "site_settings", value: JSON.stringify({ ...currentSaved, [contractField]: fileUrl }) },
    });

    revalidatePath("/admin/settings");

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "خطأ غير متوقع" }, { status: 500 });
  }
}
