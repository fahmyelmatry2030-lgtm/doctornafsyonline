import { NextResponse } from "next/server";
import { auth, isExactAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET Handler
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: { startsWith: "ADMIN" } },
          { role: "SHIFT_LEADER" }
        ]
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

// POST Handler
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

    if (!role.startsWith("ADMIN") && role !== "SHIFT_LEADER") {
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

// DELETE Handler
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

    // Verify user exists and is actually an ADMIN or SHIFT_LEADER
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
    }

    if (!user.role.startsWith("ADMIN") && user.role !== "SHIFT_LEADER") {
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

// PUT Handler
export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { id, name, role, isSuspended } = data;

    if (!id) {
      return NextResponse.json({ error: "معرف المدير مطلوب" }, { status: 400 });
    }

    // Prevent modifying oneself
    if (session.user.id === id) {
      return NextResponse.json({ error: "لا يمكنك تعديل حسابك الشخصي" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isSuspended: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update manager error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث المدير" }, { status: 500 });
  }
}
