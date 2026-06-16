import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const data = await req.json();
  const article = await prisma.article.create({ data });
  return NextResponse.json(article);
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const article = await prisma.article.update({ where: { id }, data });
  return NextResponse.json(article);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
