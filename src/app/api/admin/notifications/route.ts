import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const notifications = await prisma.systemNotification.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const { title, message, target } = await req.json();
  const notification = await prisma.systemNotification.create({
    data: { title, message, target },
  });
  return NextResponse.json(notification);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.systemNotification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
