"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/operations");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    return { success: false, error: "فشل تحديث حالة الموعد" };
  }
}
