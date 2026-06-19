import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_VIEWER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const notifications = await prisma.systemNotification.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { title, message, target } = await req.json();
  const notification = await prisma.systemNotification.create({
    data: { title, message, target },
  });
  return NextResponse.json(notification);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.systemNotification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
