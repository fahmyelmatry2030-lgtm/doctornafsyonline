import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_VIEWER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { code, discount, expiresAt } = await req.json();
  const promo = await prisma.promoCode.create({
    data: { code: code.toUpperCase(), discount: Number(discount), expiresAt: new Date(expiresAt) },
  });
  return NextResponse.json(promo);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, isActive } = await req.json();
  const promo = await prisma.promoCode.update({ where: { id }, data: { isActive } });
  return NextResponse.json(promo);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
