import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/contracts/[type] — redirects to the Cloudinary PDF URL
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!["trial", "marketing", "annual"].includes(type)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const contractField =
      type === "trial"     ? "trialContractUrl" :
      type === "marketing" ? "marketingContractUrl" :
                             "annualContractUrl";

    const dbRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" },
    });

    if (!dbRecord) {
      return new NextResponse("العقد غير موجود. يرجى رفع العقد من صفحة الإعدادات.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const settings = JSON.parse(dbRecord.value);
    const contractUrl = settings[contractField];

    if (!contractUrl || contractUrl.startsWith("/docs/")) {
      return new NextResponse("العقد غير موجود. يرجى رفع العقد من صفحة الإعدادات.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Redirect to the Cloudinary URL
    return NextResponse.redirect(contractUrl);
  } catch (error) {
    console.error("Contract serve error:", error);
    return new NextResponse("حدث خطأ", { status: 500 });
  }
}
