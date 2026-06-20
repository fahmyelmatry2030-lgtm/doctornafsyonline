import { NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/certificates";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "كود التحقق مطلوب" }, { status: 400 });
    }

    const certificate = await getCertificateByCode(code);

    if (!certificate) {
      return NextResponse.json({ error: "الشهادة غير مسجلة أو لم يتم العثور عليها" }, { status: 404 });
    }

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("Verification API error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التحقق من الشهادة" }, { status: 500 });
  }
}
