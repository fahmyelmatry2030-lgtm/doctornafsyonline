"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTherapistSalary(
  therapistId: string,
  salaryType: "FIXED" | "COMMISSION" | "HOURLY" | string,
  salary: number,
  paymentMethod?: string,
  paymentDetails?: string
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("غير مصرح لك");
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING") {
      throw new Error("لا تملك الصلاحية لتعديل المرتبات");
    }

    // Check if therapist profile exists
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: therapistId },
    });

    if (!profile) {
      // Automatically create a profile if it doesn't exist
      await prisma.therapistProfile.create({
        data: {
          userId: therapistId,
          bio: "أخصائي نفسي",
          specializations: "علاج نفسي",
          pricePerSession: 300, // default price
          salaryType,
          salary,
          paymentMethod: paymentMethod || "VODAFONE_CASH",
          paymentDetails: paymentDetails || "",
        },
      });
    } else {
      // Update salary details
      await prisma.therapistProfile.update({
        where: { userId: therapistId },
        data: {
          salaryType,
          salary,
          paymentMethod: paymentMethod || "VODAFONE_CASH",
          paymentDetails: paymentDetails || "",
        },
      });
    }

    revalidatePath("/admin/salaries");
    return { success: true, message: "تم تحديث بيانات الراتب بنجاح" };
  } catch (error: any) {
    console.error("[Action] updateTherapistSalary error:", error);
    return { success: false, error: error.message || "فشل تحديث البيانات" };
  }
}
