"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { updateTherapistProfile } from "./actions";
import { formatPrice } from "@/lib/constants";

type TherapistProfile = {
  bio: string;
  specializations: string;
  pricePerSession: number;
  yearsExperience: number;
  isAvailable: boolean;
  user: {
    name: string;
    currency?: string;
  };
  salaryType?: "FIXED" | "COMMISSION";
  internationalPrice?: number | null;
  internationalCurrency?: string | null;
};

type TherapistProfileFormProps = {
  profile: TherapistProfile;
  settings: {
    minPrice: number;
    maxPrice: number;
  };
};

export default function TherapistProfileForm({ profile, settings }: TherapistProfileFormProps) {
  const [bio, setBio] = useState(profile.bio);
  const [specializations, setSpecializations] = useState(profile.specializations);
  const [pricePerSession, setPricePerSession] = useState(profile.pricePerSession);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [isAvailable, setIsAvailable] = useState(profile.isAvailable);
  const [internationalPrice, setInternationalPrice] = useState(profile.internationalPrice || 0);
  const [internationalCurrency, setInternationalCurrency] = useState(profile.internationalCurrency || "USD");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("specializations", specializations);
      formData.append("pricePerSession", String(pricePerSession));
      formData.append("internationalPrice", String(internationalPrice));
      formData.append("internationalCurrency", internationalCurrency);
      formData.append("yearsExperience", String(yearsExperience));
      formData.append("isAvailable", String(isAvailable));

      const res = await updateTherapistProfile(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "فشل تحديث الملف الشخصي");
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>تم حفظ التعديلات بنجاح!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">الاسم (للعرض فقط)</label>
          <input type="text" defaultValue={profile.user.name} disabled className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-3 px-4 text-slate-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">سنوات الخبرة</label>
          <input 
            type="number" 
            name="yearsExperience" 
            value={yearsExperience} 
            onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
            min="1" 
            className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          سعر الجلسة (الحد الأدنى المسموح به: {formatPrice(settings.minPrice, profile.user.currency)} · الحد الأقصى: {formatPrice(settings.maxPrice, profile.user.currency)})
        </label>
        <div className="relative">
          <input 
            type="number" 
            name="pricePerSession" 
            value={pricePerSession} 
            onChange={(e) => setPricePerSession(parseInt(e.target.value) || 0)}
            min={settings.minPrice} 
            max={settings.maxPrice} 
            disabled={profile.salaryType === "FIXED"}
            className={`block w-full rounded-xl border border-[var(--color-border-soft)] py-3 pl-12 pr-4 text-slate-900 transition-all shadow-sm ${profile.salaryType === "FIXED" ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white/50 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"}`}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 font-semibold">
            {formatPrice(0, profile.user.currency).replace(/[\d.,]/g, "").trim()}
          </div>
        </div>
        {profile.salaryType === "FIXED" && (
          <p className="mt-2 text-xs text-amber-600 font-medium">
            أنت تعمل بنظام المرتب الشهري الثابت، لذلك يتم تحديد سعر الجلسة من قِبل الإدارة ولا يمكنك تعديله من هنا.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
        <div>
          <label className="block text-sm font-semibold text-indigo-900 mb-2">السعر الدولي (للمرضى من خارج دولتك)</label>
          <input 
            type="number" 
            name="internationalPrice" 
            value={internationalPrice} 
            onChange={(e) => setInternationalPrice(parseInt(e.target.value) || 0)}
            disabled={profile.salaryType === "FIXED"}
            className={`block w-full rounded-xl border border-indigo-200 py-3 px-4 text-slate-900 transition-all shadow-sm ${profile.salaryType === "FIXED" ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"}`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-indigo-900 mb-2">العملة الدولية</label>
          <select 
            value={internationalCurrency}
            onChange={(e) => setInternationalCurrency(e.target.value)}
            disabled={profile.salaryType === "FIXED"}
            className={`block w-full rounded-xl border border-indigo-200 py-3 px-4 text-slate-900 transition-all shadow-sm ${profile.salaryType === "FIXED" ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"}`}
          >
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="AED">درهم إماراتي (AED)</option>
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="EUR">يورو (EUR)</option>
            <option value="GBP">جنيه إسترليني (GBP)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">التخصصات (مفصولة بفاصلة)</label>
        <input 
          type="text" 
          name="specializations" 
          value={specializations} 
          onChange={(e) => setSpecializations(e.target.value)}
          placeholder="مثال: القلق، الاكتئاب، العلاقات الزوجية" 
          className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">نبذة تعريفية (Bio)</label>
        <textarea 
          name="bio" 
          rows={4} 
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3 px-4 text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm resize-none"
        ></textarea>
      </div>

      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
        <input 
          type="checkbox" 
          id="isAvailable" 
          checked={isAvailable} 
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" 
        />
        <label htmlFor="isAvailable" className="font-semibold text-indigo-900 cursor-pointer select-none">
          متاح لاستقبال حجوزات جديدة
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        حفظ التعديلات
      </button>
    </form>
  );
}
