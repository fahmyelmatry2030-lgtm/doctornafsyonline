"use client";

import { useState } from "react";
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

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        therapistId: therapist.id,
        scheduledAt,
        type: sessionType,
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
  // Construct datetime-local string format YYYY-MM-DDTHH:mm based on local time fields
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, "0");
  const day = String(minDate.getDate()).padStart(2, "0");
  const hours = String(minDate.getHours()).padStart(2, "0");
  const minutes = String(minDate.getMinutes()).padStart(2, "0");
  const minDateStr = `${year}-${month}-${day}T${hours}:${minutes}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
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
            <div className="mb-6 text-center">
              <span className="text-3xl font-bold text-teal-700">
                {formatPrice(profile.pricePerSession)}
              </span>
              <span className="text-sm text-slate-500"> / جلسة 50 دقيقة</span>
            </div>

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

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                موعد الجلسة
              </label>
              <input
                type="datetime-local"
                required
                min={minDateStr}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
              />
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
              الجلسة تتم داخل المنصة — فيديو، صوت، وشات
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
