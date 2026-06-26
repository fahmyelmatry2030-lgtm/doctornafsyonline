import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!["trial", "marketing", "annual"].includes(type)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const dbKey = `contract_pdf_${type}`;
    const record = await prisma.systemSetting.findUnique({
      where: { key: dbKey },
    });

    if (!record || !record.value) {
      return new NextResponse("العقد غير موجود. يرجى رفع العقد من صفحة الإعدادات.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const buffer = Buffer.from(record.value, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${type}_contract.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Contract serve error:", error);
    return new NextResponse("حدث خطأ في تحميل العقد", { status: 500 });
  }
}
