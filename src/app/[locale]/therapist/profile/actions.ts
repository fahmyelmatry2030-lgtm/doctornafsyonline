"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/app/[locale]/admin/settings/actions";

export async function updateTherapistProfile(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== "THERAPIST") {
    return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const bio = (formData.get("bio") as string) || "";
  const specializations = (formData.get("specializations") as string) || "";
  let pricePerSession = parseInt((formData.get("pricePerSession") as string) || "0");
  const yearsExperience = parseInt((formData.get("yearsExperience") as string) || "1");
  const isAvailable = formData.get("isAvailable") === "true";

  const currentSettings = await getSettings();
  if (isNaN(pricePerSession) || pricePerSession < currentSettings.minPrice) {
    pricePerSession = currentSettings.minPrice;
  }
  if (pricePerSession > currentSettings.maxPrice) {
    pricePerSession = currentSettings.maxPrice;
  }

  try {
    await prisma.therapistProfile.update({
      where: { userId },
      data: {
        bio,
        specializations,
        pricePerSession,
        yearsExperience: isNaN(yearsExperience) ? 1 : yearsExperience,
        isAvailable,
      },
    });

    revalidatePath("/therapist/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update therapist profile:", err);
    return { success: false, error: "فشل تحديث البيانات في قاعدة البيانات" };
  }
}
