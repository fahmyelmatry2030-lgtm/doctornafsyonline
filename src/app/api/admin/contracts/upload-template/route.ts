import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // Allow any admin role
  const role = session.user.role || "";
  if (!role.startsWith("ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
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

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 10 ميجابايت" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Store PDF as base64 in DB (LongText column — supports up to 4GB)
    const dbKey = `contract_pdf_${templateType}`;
    await prisma.systemSetting.upsert({
      where: { key: dbKey },
      update: { value: base64 },
      create: { key: dbKey, value: base64 },
    });

    // Update URL in site_settings to point to our API
    const fileUrl = `/api/contracts/${templateType}`;
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
    console.error("Template upload error:", error);
    return NextResponse.json({ error: `فشل: ${error.message}` }, { status: 500 });
  }
}
