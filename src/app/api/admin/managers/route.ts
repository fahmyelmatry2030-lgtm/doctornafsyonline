import { NextResponse } from "next/server";
import { auth, isExactAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const managers = await prisma.user.findMany({
      where: {
        role: {
          startsWith: "ADMIN",
          not: "ADMIN_HR"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isSuspended: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(managers);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب المديرين" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isExactAdmin(session?.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (!role.startsWith("ADMIN")) {
      return NextResponse.json({ error: "دور غير صالح" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء المدير" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف المدير مطلوب" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (session.user.id === id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الشخصي" }, { status: 400 });
    }

    // Verify user exists and is actually an ADMIN
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
    }

    if (!user.role.startsWith("ADMIN")) {
      return NextResponse.json({ error: "هذا الحساب ليس مديراً" }, { status: 400 });
    }

    // Delete manager user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete manager error:", error);
    return NextResponse.json({ error: "فشل في حذف المدير" }, { status: 500 });
  }
}
