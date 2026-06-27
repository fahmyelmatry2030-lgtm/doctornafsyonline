import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getSettings } from "@/app/[locale]/admin/settings/actions";

const updateContractJson = (currentVal: string | null, type: string, url: string | null) => {
  let contracts: Record<string, any> = {};
  if (currentVal) {
    const rawVal = typeof currentVal === 'string' ? currentVal.trim() : (typeof currentVal === 'object' && currentVal !== null ? JSON.stringify(currentVal) : "");
    if (rawVal) {
      if (rawVal.startsWith("{") || rawVal.startsWith("[")) {
        try {
          contracts = JSON.parse(rawVal);
        } catch {
          contracts = { trial: { url: rawVal, status: "APPROVED", uploadedAt: new Date().toISOString() } };
        }
      } else {
        contracts = { trial: { url: rawVal, status: "APPROVED", uploadedAt: new Date().toISOString() } };
      }
    }
  }
  
  if (url) {
    contracts[type] = {
      url,
      status: "PENDING",
      uploadedAt: new Date().toISOString()
    };
  } else {
    delete contracts[type];
  }
  
  return JSON.stringify(contracts);
};

const updateContractStatusJson = (currentVal: string | null, type: string, status: string) => {
  let contracts: Record<string, any> = {};
  if (currentVal) {
    const rawVal = typeof currentVal === 'string' ? currentVal.trim() : (typeof currentVal === 'object' && currentVal !== null ? JSON.stringify(currentVal) : "");
    if (rawVal) {
      if (rawVal.startsWith("{") || rawVal.startsWith("[")) {
        try {
          contracts = JSON.parse(rawVal);
        } catch {
          contracts = { trial: { url: rawVal, status: "APPROVED", uploadedAt: new Date().toISOString() } };
        }
      } else {
        contracts = { trial: { url: rawVal, status: "APPROVED", uploadedAt: new Date().toISOString() } };
      }
    }
  }
  
  if (contracts[type]) {
    contracts[type].status = status;
  }
  
  return JSON.stringify(contracts);
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "THERAPIST" && !role.startsWith("ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");

  const targetUserId = role.startsWith("ADMIN") && therapistId ? therapistId : session.user.id;

  try {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId },
      select: { contractUrl: true, createdAt: true }
    });

    const settings = await getSettings();
    let enableAnnualContract = settings.enableAnnualContract ?? false;

    // Hide annual contract for therapists in their first 14 days (trial period)
    if (role === "THERAPIST" && profile) {
      const profileCreatedAt = profile.createdAt;
      const daysSinceCreation = (new Date().getTime() - new Date(profileCreatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 14) {
        enableAnnualContract = false;
      }
    }

    return NextResponse.json({
      contractUrl: profile?.contractUrl || null,
      enableAnnualContract,
      trialTemplateUrl: settings.trialContractUrl || "/docs/trial_contract_template.pdf",
      marketingTemplateUrl: settings.marketingContractUrl || "/docs/marketing_consent_template.pdf",
      annualTemplateUrl: settings.annualContractUrl || "/docs/annual_contract_template.pdf",
    });
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
  if (role !== "THERAPIST" && !role.startsWith("ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let therapistId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      therapistId = (formData.get("therapistId") as string) || null;
      const contractType = (formData.get("contractType") as string) || "trial"; // trial, marketing, annual

      const targetUserId = role.startsWith("ADMIN") && therapistId ? therapistId : session.user.id;

      if (!file) {
        return NextResponse.json({ error: "يرجى رفع ملف PDF صالح" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      let uploadedUrl: string | null = null;

      try {
        // Upload to Cloudinary
        uploadedUrl = await uploadToCloudinary(buffer, `contracts/${targetUserId}`, safeName);
      } catch (cloudinaryError) {
        console.warn("[Contract Upload] Cloudinary upload failed, falling back to local file system:", cloudinaryError);
        
        const uploadDir = path.join(process.cwd(), "public", "uploads", "contracts", targetUserId);
        await fs.mkdir(uploadDir, { recursive: true });
        try { await fs.chmod(uploadDir, 0o755); } catch (e) {}
        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, buffer);
        try { await fs.chmod(filePath, 0o644); } catch (e) {}
        uploadedUrl = `/uploads/contracts/${targetUserId}/${safeName}`;
      }

      const profile = await prisma.therapistProfile.findUnique({ where: { userId: targetUserId } });
      if (!profile) {
        return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
      }

      const updatedContractJson = updateContractJson(profile.contractUrl, contractType, uploadedUrl);

      await prisma.therapistProfile.update({
        where: { userId: targetUserId },
        data: { contractUrl: updatedContractJson }
      });

      return NextResponse.json({ success: true, contractUrl: updatedContractJson });
    }

    // JSON payload (Admin status updates or direct edits)
    const body = await request.json();
    const { contractType, status, contractUrl } = body;
    therapistId = body.therapistId;
    const targetUserId = role.startsWith("ADMIN") && therapistId ? therapistId : session.user.id;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    let updatedContractJson = profile.contractUrl;

    if (status) {
      // Update existing contract status (e.g. APPROVED, REJECTED)
      updatedContractJson = updateContractStatusJson(profile.contractUrl, contractType || "trial", status);
    } else if (contractUrl) {
      // Direct URL upload / set
      updatedContractJson = updateContractJson(profile.contractUrl, contractType || "trial", contractUrl);
    }

    await prisma.therapistProfile.update({
      where: { userId: targetUserId },
      data: { contractUrl: updatedContractJson }
    });

    return NextResponse.json({ success: true, contractUrl: updatedContractJson });
  } catch (error) {
    console.error("Contract upload error:", error);
    return NextResponse.json({ error: "فشل تحديث العقد" }, { status: 500 });
  }
}
