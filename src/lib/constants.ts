export const SPECIALIZATIONS = [
  "القلق والتوتر",
  "الاكتئاب",
  "العلاقات الزوجية",
  "مشكلات الأطفال والمراهقين",
  "الصدمات النفسية",
  "اضطرابات النوم",
  "الإدمان",
  "الاحتراق الوظيفي",
  "النمو الشخصي",
  "الوسواس القهري",
  "نوبات الهلع",
  "الفقد والحزن",
  "ضغوط العمل",
  "الثقة بالنفس",
  "الإرشاد الأسري",
] as const;

export const SESSION_TYPES = {
  VIDEO: { label: "فيديو", icon: "video" },
  AUDIO: { label: "صوت", icon: "phone" },
  CHAT: { label: "محادثة نصية", icon: "message" },
} as const;

export const PLATFORM_PHONE = "01010423661";
export const PLATFORM_PHONE_TEL = `tel:${PLATFORM_PHONE}`;
export const PLATFORM_INSTAPAY = `${PLATFORM_PHONE}@instapay`;

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ar-EG")} ج.م`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function parseSpecializations(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}
