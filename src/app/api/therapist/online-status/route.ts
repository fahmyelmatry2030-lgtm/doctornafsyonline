import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ isOnline: false });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isOnline: true }
    });
    return NextResponse.json({ isOnline: user?.isOnline || false });
  } catch (error) {
    return NextResponse.json({ isOnline: false });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { isOnline } = await req.json();
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isOnline }
    });

    if (isOnline) {
      await prisma.onlineStatusLog.create({
        data: {
          userId: session.user.id,
          status: "ONLINE"
        }
      });
    } else {
      await prisma.onlineStatusLog.create({
        data: {
          userId: session.user.id,
          status: "OFFLINE"
        }
      });
    }

    return NextResponse.json({ success: true, isOnline });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
