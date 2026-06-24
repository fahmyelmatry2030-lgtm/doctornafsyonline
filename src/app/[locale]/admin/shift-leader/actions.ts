"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createShift(data: {
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  description?: string;
  shiftLeaderId?: string | null;
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_HR")) {
      throw new Error("غير مصرح لك بإجراء هذه العملية");
    }

    const shift = await prisma.shift.create({
      data: {
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description || "",
        shiftLeaderId: data.shiftLeaderId || null,
        isActive: true,
      },
    });

    revalidatePath("/admin/shift-leader");
    return { success: true, shift };
  } catch (error: any) {
    console.error("[Shift Action] createShift error:", error);
    return { success: false, error: error.message || "فشل إنشاء الشيفت" };
  }
}

export async function updateShift(
  shiftId: string,
  data: {
    name: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    description?: string;
    shiftLeaderId?: string | null;
    isActive?: boolean;
  }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_HR")) {
      throw new Error("غير مصرح لك بإجراء هذه العملية");
    }

    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description || "",
        shiftLeaderId: data.shiftLeaderId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath("/admin/shift-leader");
    return { success: true, shift };
  } catch (error: any) {
    console.error("[Shift Action] updateShift error:", error);
    return { success: false, error: error.message || "فشل تحديث الشيفت" };
  }
}

export async function deleteShift(shiftId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("غير مصرح لك. صلاحية مدير النظام مطلوبة للحذف");
    }

    await prisma.shift.delete({
      where: { id: shiftId },
    });

    revalidatePath("/admin/shift-leader");
    return { success: true, message: "تم حذف الشيفت بنجاح" };
  } catch (error: any) {
    console.error("[Shift Action] deleteShift error:", error);
    return { success: false, error: error.message || "فشل حذف الشيفت" };
  }
}

export async function assignSpecialistToShift(shiftId: string, therapistId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_HR")) {
      throw new Error("غير مصرح لك بإجراء هذه العملية");
    }

    // Check if already assigned (active or inactive)
    const existing = await prisma.specialistShiftAssignment.findUnique({
      where: {
        shiftId_therapistId: { shiftId, therapistId },
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new Error("الأخصائي معين بالفعل في هذا الشيفت");
      } else {
        await prisma.specialistShiftAssignment.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
    } else {
      await prisma.specialistShiftAssignment.create({
        data: {
          shiftId,
          therapistId,
          isActive: true,
        },
      });
    }

    revalidatePath("/admin/shift-leader");
    return { success: true, message: "تم إضافة الأخصائي للشيفت بنجاح" };
  } catch (error: any) {
    console.error("[Shift Action] assignSpecialist error:", error);
    return { success: false, error: error.message || "فشل إضافة الأخصائي" };
  }
}

export async function removeSpecialistFromShift(shiftId: string, therapistId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_HR")) {
      throw new Error("غير مصرح لك بإجراء هذه العملية");
    }

    await prisma.specialistShiftAssignment.update({
      where: {
        shiftId_therapistId: { shiftId, therapistId },
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/admin/shift-leader");
    return { success: true, message: "تم إزالة الأخصائي من الشيفت" };
  } catch (error: any) {
    console.error("[Shift Action] removeSpecialist error:", error);
    return { success: false, error: error.message || "فشل إزالة الأخصائي" };
  }
}
