import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const role = (session.user.role || "").toUpperCase();
    if (!role.includes("ADMIN")) {
      return NextResponse.json({ error: `غير مصرح - دورك: ${session.user.role}` }, { status: 401 });
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

    // Read file to buffer and convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Verify it's a valid PDF (starts with %PDF)
    const header = buffer.slice(0, 5).toString("ascii");
    if (!header.startsWith("%PDF")) {
      return NextResponse.json({ error: "الملف ليس PDF صالح" }, { status: 400 });
    }

    // Store in DB
    const dbKey = `contract_pdf_${templateType}`;
    await prisma.systemSetting.upsert({
      where: { key: dbKey },
      update: { value: base64 },
      create: { key: dbKey, value: base64 },
    });

    // Verify it was stored correctly
    const check = await prisma.systemSetting.findUnique({ where: { key: dbKey } });
    if (!check || check.value.length !== base64.length) {
      return NextResponse.json({ 
        error: `فشل التخزين: الحجم المتوقع ${base64.length} والمخزن ${check?.value.length || 0}` 
      }, { status: 500 });
    }

    // Update URL in site_settings
    const fileUrl = `/api/contracts/${templateType}`;
    const contractField =
      templateType === "trial"     ? "trialContractUrl" :
      templateType === "marketing" ? "marketingContractUrl" :
                                     "annualContractUrl";

    const dbRecord = await prisma.systemSetting.findUnique({ where: { key: "site_settings" } });
    const currentSaved = dbRecord ? JSON.parse(dbRecord.value) : {};

    await prisma.systemSetting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify({ ...currentSaved, [contractField]: fileUrl }) },
      create: { key: "site_settings", value: JSON.stringify({ ...currentSaved, [contractField]: fileUrl }) },
    });

    revalidatePath("/admin/settings");
    return NextResponse.json({ 
      success: true, 
      url: fileUrl, 
      size: base64.length,
      message: `تم رفع العقد بنجاح (${(file.size / 1024).toFixed(0)} KB)`
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "خطأ غير متوقع" }, { status: 500 });
  }
}
