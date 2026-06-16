"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src/data/settings.json");

export type SiteSettings = {
  commission: number;
  minPrice: number;
  maxPrice: number;
  sessionDuration: number;
  platformName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  allowNewTherapists: boolean;
  allowNewPatients: boolean;
  maintenanceMode: boolean;
  emailOnBooking: boolean;
  emailOnCancel: boolean;
  smsEnabled: boolean;
  twoFactor: boolean;
  sessionTimeout: number;
  stripeKey: string;
  livekitKey: string;
  livekitUrl: string;
};

const defaultSettings: Omit<SiteSettings, "stripeKey" | "livekitKey" | "livekitUrl"> & { stripeKey?: string; livekitKey?: string; livekitUrl?: string } = {
  commission: 20,
  minPrice: 100,
  maxPrice: 1000,
  sessionDuration: 50,
  platformName: "دكتور نفسي",
  heroTitle: "رعاية نفسية متخصصة في متناول يدك",
  heroSubtitle: "تواصل مع أفضل الأخصائيين النفسيين المعتمدين من راحة منزلك، عبر جلسات فيديو آمنة وسرية.",
  contactEmail: "support@nafsi.com",
  allowNewTherapists: true,
  allowNewPatients: true,
  maintenanceMode: false,
  emailOnBooking: true,
  emailOnCancel: true,
  smsEnabled: false,
  twoFactor: false,
  sessionTimeout: 30,
};

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح لك بالقيام بهذا الإجراء. الصلاحية مطلوبة.");
  }
}

export async function getSettings(): Promise<SiteSettings> {
  // We don't verifyAdmin here because some public/patient pages may need platformName or sessionDuration
  let settings: any = {};
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, "utf8");
    settings = JSON.parse(data);
  } catch {
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write default settings file:", e);
    }
    settings = { ...defaultSettings };
  }

  // Always bind credentials from environment variables for maximum security
  return {
    ...settings,
    stripeKey: process.env.STRIPE_SECRET_KEY || settings.stripeKey || "sk_test_***",
    livekitKey: process.env.LIVEKIT_API_SECRET || settings.livekitKey || "lk_secret_***",
    livekitUrl: process.env.LIVEKIT_URL || settings.livekitUrl || "wss://your-livekit.livekit.cloud",
  };
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  await verifyAdmin();
  const current = await getSettings();
  
  // Extract sensitive keys so we do NOT save them to the JSON file
  const { stripeKey, livekitKey, livekitUrl, ...savableSettings } = settings;
  const { stripeKey: cS, livekitKey: cL, livekitUrl: cU, ...currentSavable } = current;

  const updatedSavable = { ...currentSavable, ...savableSettings };
  
  await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updatedSavable, null, 2), "utf8");
  
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/operations");
  
  return {
    ...updatedSavable,
    stripeKey: process.env.STRIPE_SECRET_KEY || stripeKey || current.stripeKey,
    livekitKey: process.env.LIVEKIT_API_SECRET || livekitKey || current.livekitKey,
    livekitUrl: process.env.LIVEKIT_URL || livekitUrl || current.livekitUrl,
  };
}
