"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, BadgeCheck, Clock, Video, Phone, MessageCircle } from "lucide-react";
import { formatPrice, parseSpecializations } from "@/lib/constants";

type Therapist = {
  id: string;
  name: string;
  therapistProfile: {
    bio: string;
    specializations: string;
    pricePerSession: number;
    yearsExperience: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    languages: string;
  };
};

export default function TherapistDetailPage({
  therapist,
}: {
  therapist: Therapist;
}) {
  const router = useRouter();
  const profile = therapist.therapistProfile;
  const specs = parseSpecializations(profile.specializations);

  const [sessionType, setSessionType] = useState<"VIDEO" | "AUDIO" | "CHAT">("VIDEO");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [availableDays] = useState(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 45; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const label = d.toLocaleDateString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      days.push({ key, label });
    }
    return days;
  });

  const [selectedDay, setSelectedDay] = useState(availableDays[0]?.key || "");
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("PM");

  useEffect(() => {
    if (!selectedDay) return;
    let hr = parseInt(selectedHour, 10);
    if (selectedPeriod === "PM" && hr < 12) hr += 12;
    if (selectedPeriod === "AM" && hr === 12) hr = 0;
    const hrStr = String(hr).padStart(2, "0");
    setScheduledAt(`${selectedDay}T${hrStr}:${selectedMinute}`);
  }, [selectedDay, selectedHour, selectedMinute, selectedPeriod]);

  // Coupon Code State
  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  // Dynamic Arabic date preview helper
  const getArabicDatePreview = (dtStr: string) => {
    if (!dtStr) return "";
    try {
      const dateObj = new Date(dtStr);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toLocaleString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  async function handleVerifyCoupon() {
    if (!coupon.trim()) return;
    setVerifyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "كود الخصم غير صالح");
      } else {
        setAppliedDiscount(data.discount);
        setCouponSuccess(`تم تطبيق الخصم بنجاح! خصم بقيمة ${data.discount}%`);
      }
    } catch {
      setCouponError("فشل التحقق من الكود");
    } finally {
      setVerifyingCoupon(false);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        therapistId: therapist.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        type: sessionType,
        promoCode: appliedDiscount !== null ? coupon : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setError(data.error || "فشل الحجز");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, "0");
  const day = String(minDate.getDate()).padStart(2, "0");
  const hours = String(minDate.getHours()).padStart(2, "0");
  const minutes = String(minDate.getMinutes()).padStart(2, "0");
  const minDateStr = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Price calculations based on discount code
  const discountPercent = appliedDiscount || 0;
  const originalPrice = profile.pricePerSession;
  const finalPrice = Math.max(0, Math.round(originalPrice * (1 - discountPercent / 100)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-8">
            <div className="mb-6 flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-teal-200 text-3xl font-bold text-teal-700">
                {therapist.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {therapist.name}
                  </h1>
                  {profile.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      معتمد
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {profile.rating.toFixed(1)} ({profile.reviewCount} تقييم)
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {profile.yearsExperience} سنوات خبرة
                  </span>
                </div>
              </div>
            </div>

            <h2 className="mb-3 font-bold text-slate-800">نبذة عن الأخصائي</h2>
            <p className="mb-6 leading-relaxed text-slate-600">{profile.bio}</p>

            <h2 className="mb-3 font-bold text-slate-800">التخصصات</h2>
            <div className="mb-6 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full bg-teal-50 px-4 py-1.5 text-sm text-teal-700"
                >
                  {spec}
                </span>
              ))}
            </div>

            <p className="text-sm text-slate-500">
              اللغات: {profile.languages}
            </p>
          </div>
        </div>

        <div>
          <form
            onSubmit={handleBook}
            className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            {appliedDiscount !== null ? (
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-3xl font-bold text-teal-700">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
                <span className="text-xs text-teal-600 font-bold block mt-1">تطبيق خصم بقيمة {discountPercent}%</span>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-teal-700">
                  {formatPrice(originalPrice)}
                </span>
                <span className="text-sm text-slate-500"> / جلسة 50 دقيقة</span>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                نوع الجلسة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { type: "VIDEO" as const, icon: Video, label: "فيديو" },
                    { type: "AUDIO" as const, icon: Phone, label: "صوت" },
                    { type: "CHAT" as const, icon: MessageCircle, label: "شات" },
                  ] as const
                ).map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSessionType(type)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition ${
                      sessionType === type
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                موعد الجلسة
              </label>
              
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">اختر اليوم:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white font-medium text-slate-800"
                >
                  {availableDays.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">الساعة:</span>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-teal-400 bg-white text-center font-bold text-slate-800"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">الدقيقة:</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-teal-400 bg-white text-center font-bold text-slate-800"
                  >
                    {["00", "15", "30", "45"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">الفترة:</span>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-teal-400 bg-white text-center font-bold text-slate-800"
                  >
                    <option value="PM">مساءً</option>
                    <option value="AM">صباحاً</option>
                  </select>
                </div>
              </div>

              {scheduledAt && (
                <div className="mt-3 p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-xs font-bold text-teal-800 text-right animate-fade-in flex items-center justify-between">
                  <span>الموعد المختار:</span>
                  <span className="text-teal-900">{getArabicDatePreview(scheduledAt)}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                كود الخصم (اختياري)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponError("");
                    setCouponSuccess("");
                  }}
                  placeholder="مثال: NAFSI15"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 text-left font-semibold placeholder:text-slate-300"
                  disabled={verifyingCoupon || appliedDiscount !== null}
                />
                {appliedDiscount === null ? (
                  <button
                    type="button"
                    onClick={handleVerifyCoupon}
                    disabled={verifyingCoupon || !coupon.trim()}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 transition disabled:opacity-50 shrink-0"
                  >
                    {verifyingCoupon ? "جاري..." : "تطبيق"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon("");
                      setAppliedDiscount(null);
                      setCouponSuccess("");
                    }}
                    className="rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium text-xs px-4 py-2.5 transition shrink-0"
                  >
                    إلغاء
                  </button>
                )}
              </div>
              {couponError && (
                <p className="mt-1 text-xs text-red-600">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="mt-1 text-xs text-green-600">{couponSuccess}</p>
              )}
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 py-3.5 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "جاري الحجز..." : "احجز الجلسة"}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              الجلسة تتم داخل المنصة — فيديو، صوت، وغرفة العلاج
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
