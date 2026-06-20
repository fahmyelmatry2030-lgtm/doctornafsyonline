import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code?.trim()) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findFirst({
      where: {
        code: {
          equals: code.trim(),
        },
      },
    });

    if (!promo) {
      return NextResponse.json({ error: "كود الخصم هذا غير صالح" }, { status: 400 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "كود الخصم هذا لم يعد نشطاً" }, { status: 400 });
    }

    if (new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: "كود الخصم هذا انتهت صلاحيته" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discount: promo.discount, // percentage
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ error: "فشل التحقق من كود الخصم" }, { status: 500 });
  }
}
