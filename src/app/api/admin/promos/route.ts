import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(req: Request) {
  const { code, discount, expiresAt } = await req.json();
  const promo = await prisma.promoCode.create({
    data: { code: code.toUpperCase(), discount: Number(discount), expiresAt: new Date(expiresAt) },
  });
  return NextResponse.json(promo);
}

export async function PUT(req: Request) {
  const { id, isActive } = await req.json();
  const promo = await prisma.promoCode.update({ where: { id }, data: { isActive } });
  return NextResponse.json(promo);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
