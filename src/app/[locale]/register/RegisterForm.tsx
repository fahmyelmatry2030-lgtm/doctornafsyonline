"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authenticateAfterRegister } from "./actions";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Heart, ShieldCheck, Briefcase, Clock, DollarSign, Users, Eye, EyeOff, MapPin, Globe } from "lucide-react";

export const ARAB_COUNTRIES = [
  { id: "Egypt", name: "مصر", code: "+20", currency: "EGP", currencyLabel: "ج.م" },
  { id: "Saudi Arabia", name: "السعودية", code: "+966", currency: "SAR", currencyLabel: "ر.س" },
  { id: "UAE", name: "الإمارات", code: "+971", currency: "AED", currencyLabel: "د.إ" },
  { id: "Qatar", name: "قطر", code: "+974", currency: "QAR", currencyLabel: "ر.ق" },
  { id: "Kuwait", name: "الكويت", code: "+965", currency: "KWD", currencyLabel: "د.ك" },
  { id: "Oman", name: "عُمان", code: "+968", currency: "OMR", currencyLabel: "ر.ع" },
  { id: "Bahrain", name: "البحرين", code: "+973", currency: "BHD", currencyLabel: "د.ب" },
];
import { useTranslations } from "next-intl";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const t = useTranslations("Register");
  const defaultRole = searchParams.get("role") === "therapist" ? "THERAPIST" : "PATIENT";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "Egypt",
    gender: "",
    role: defaultRole as "PATIENT" | "THERAPIST",
    specializations: "",
    yearsExperience: "",
    pricePerSession: "",
    salaryType: "COMMISSION",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // التحقق من قوة كلمة المرور في المتصفح قبل الإرسال
    const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(form.password);
    const hasNumber = /\d/.test(form.password);
    if (form.password.length < 8 || !hasLetter || !hasNumber) {
      setError(t("errorWeakPassword"));
      setLoading(false);
      return;
    }

    const selectedCountryData = ARAB_COUNTRIES.find(c => c.id === form.country) || ARAB_COUNTRIES[0];
    
    // Validate phone length based on country (rough check, at least 7 digits)
    if (form.phone.length < 7) {
      setError(t("errorPhoneLength"));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        countryCode: selectedCountryData.code,
        currency: selectedCountryData.currency,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errorSubmit"));
        setLoading(false);
        return;
      }

      // Auto-login using server action
      startTransition(async () => {
        const result = await authenticateAfterRegister(form.email, form.password);
        if (result) {
          // If auto-login failed, redirect to login page
          setError(result);
          setLoading(false);
          window.location.href = "/login";
        }
      });
    } catch {
      setError(t("errorUnexpected"));
      setLoading(false);
    }
  }


  return (
    <div className="bg-[var(--color-background)] min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img src="/logo.png?v=5" alt="Logo" className="h-14 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-foreground)]">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            {t("subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          
          {/* Role Toggle */}
          <div className="mb-8 p-2 bg-slate-50 rounded-[20px] flex relative overflow-hidden border border-slate-100">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "PATIENT" })}
              className={`flex-1 flex items-center justify-center gap-3 rounded-[16px] py-4 text-base font-black transition-all relative z-10 ${
                form.role === "PATIENT"
                  ? "bg-white text-[#4318FF] shadow-md border-2 border-[#4318FF]/20"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Heart className={`h-5 w-5 ${form.role === "PATIENT" ? "text-[#4318FF]" : "text-slate-400"}`} />
              {t("patientRole")}
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "THERAPIST" })}
              className={`flex-1 flex items-center justify-center gap-3 rounded-[16px] py-4 text-base font-black transition-all relative z-10 ${
                form.role === "THERAPIST"
                  ? "bg-emerald-500 text-white shadow-md border-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <ShieldCheck className={`h-5 w-5 ${form.role === "THERAPIST" ? "text-white" : "text-slate-400"}`} />
              {t("therapistRole")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Common Fields Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t("fullName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium"
                    placeholder={form.role === "THERAPIST" ? t("fullNameTherapistPlaceholder") : t("fullNamePatientPlaceholder")}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t("emailLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium"
                    placeholder="example@email.com"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>
            </div>

            {/* Country + Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Country */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  دولة الإقامة / الجنسية
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <select
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium appearance-none"
                  >
                    {ARAB_COUNTRIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t("phoneLabel")}
                </label>
                <div className="relative flex rounded-2xl shadow-sm border border-slate-200 bg-slate-50 focus-within:border-[#4318FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4318FF]/20 overflow-hidden">
                  <span className="flex items-center px-4 bg-slate-100 border-l border-slate-200 text-slate-600 font-bold text-sm" dir="ltr">
                    {ARAB_COUNTRIES.find(c => c.id === form.country)?.code || "+20"}
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                      setForm({ ...form, phone: val });
                    }}
                    className="block w-full border-none bg-transparent py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 transition-all font-medium"
                    placeholder="xxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t("genderLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>{t("genderSelect")}</option>
                    <option value="MALE">{t("genderMale")}</option>
                    <option value="FEMALE">{t("genderFemale")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-12 text-slate-900 placeholder-slate-400 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium"
                  placeholder="••••••••"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {t("passwordHint")}
              </p>
            </div>

            {/* Therapist Specific Fields */}
            {form.role === "THERAPIST" && (
              <div className="pt-4 mt-6 border-t border-slate-100 animate-fade-in">
                <h3 className="text-sm font-black text-emerald-600 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {t("therapistDetailsTitle")}
                </h3>
                
                <div className="space-y-5">
                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t("specializationsLabel")}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.specializations}
                      onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      placeholder={t("specializationsPlaceholder")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Years of Experience */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t("yearsExperienceLabel")}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <Clock className="h-5 w-5" />
                        </div>
                        <input
                          type="number"
                          required
                          min="1"
                          value={form.yearsExperience}
                          onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    {/* Salary Type (Work Model) */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        نظام العمل المفضل
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={form.salaryType}
                          onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
                          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none"
                        >
                          <option value="COMMISSION">نظام العمولات (تحدد سعر جلستك)</option>
                          <option value="FIXED">نظام التوظيف (مرتب شهري ثابت)</option>
                        </select>
                      </div>
                    </div>

                    {/* Price Per Session (Only if COMMISSION) */}
                    {form.salaryType === "COMMISSION" && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          {t("pricePerSessionLabel")}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <input
                            type="number"
                            required={form.salaryType === "COMMISSION"}
                            min="50"
                            value={form.pricePerSession}
                            onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })}
                            className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-12 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                            placeholder="300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 font-bold text-sm">
                            {ARAB_COUNTRIES.find(c => c.id === form.country)?.currencyLabel || "ج.م"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    {t("therapistNotice")}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 animate-fade-in">
                <p className="text-sm text-rose-600 font-bold text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group flex w-full justify-center items-center gap-2 rounded-2xl px-4 py-4 text-[15px] font-black text-white transition-all hover:shadow-lg focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed ${
                form.role === "THERAPIST" 
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 hover:-translate-y-0.5" 
                  : "bg-[#4318FF] hover:bg-[#3311DB] shadow-[#4318FF]/30 hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  {form.role === "THERAPIST" ? t("submitTherapist") : t("submitPatient")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-center text-slate-500 font-medium">
            {t("agreeTermsText1")} <Link href="/terms" className="text-[#4318FF] font-bold hover:underline">{t("termsLink")}</Link> {t("agreeTermsText2")} <Link href="/privacy" className="text-[#4318FF] font-bold hover:underline">{t("privacyLink")}</Link>
          </p>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-400 font-bold">
                {t("hasAccount")}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-2xl px-4 py-4 text-sm font-bold text-[#4318FF] border-2 border-slate-100 transition-all hover:bg-slate-50 hover:border-slate-200"
            >
              {t("loginLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
