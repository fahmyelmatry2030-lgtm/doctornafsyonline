import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "THERAPIST" && role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId");

  const targetUserId = role === "ADMIN" && therapistId ? therapistId : session.user.id;

  try {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId },
      select: { contractUrl: true }
    });

    return NextResponse.json({ contractUrl: profile?.contractUrl || null });
  } catch {
    return NextResponse.json({ error: "فشل تحميل العقد" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "THERAPIST" && role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { contractUrl, therapistId } = await request.json();

    const targetUserId = role === "ADMIN" && therapistId ? therapistId : session.user.id;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return NextResponse.json({ error: "ملف الأخصائي غير موجود" }, { status: 404 });
    }

    await prisma.therapistProfile.update({
      where: { userId: targetUserId },
      data: { contractUrl }
    });

    return NextResponse.json({ success: true, contractUrl });
  } catch {
    return NextResponse.json({ error: "فشل تحديث العقد" }, { status: 500 });
  }
}
