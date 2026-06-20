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

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { select: { name: true, phone: true } },
        therapist: { select: { name: true } },
      },
    });

    if (status === "CONFIRMED") {
      try {
        const { notifyAppointmentConfirmed } = await import("@/lib/notifications");
        const formattedDate = appointment.scheduledAt.toLocaleString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        await notifyAppointmentConfirmed({
          patientName: appointment.patient.name,
          patientPhone: appointment.patient.phone,
          therapistName: appointment.therapist.name,
          dateTimeStr: formattedDate,
        });
      } catch (notifErr) {
        console.error("Failed to send confirmation notification:", notifErr);
      }
    }

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

export async function editAppointmentDetails(id: string, data: { scheduledAt: string; duration: number; price: number }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_ACCOUNTING")) {
      return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        price: data.price,
      },
    });

    revalidatePath("/admin/operations");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit appointment details:", error);
    return { success: false, error: "فشل حفظ التعديلات" };
  }
}
