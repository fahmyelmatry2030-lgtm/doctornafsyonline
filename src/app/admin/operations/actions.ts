"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_ACCOUNTING")) {
      return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/operations");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    return { success: false, error: "فشل تحديث حالة الموعد" };
  }
}

export async function rejectAppointmentPayment(id: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_ACCOUNTING")) {
      return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    await prisma.appointment.update({
      where: { id },
      data: { 
        paymentScreenshot: null, 
        status: "PENDING" 
      },
    });
    revalidatePath("/admin/operations");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject payment:", error);
    return { success: false, error: "فشل رفض الدفعة" };
  }
}
