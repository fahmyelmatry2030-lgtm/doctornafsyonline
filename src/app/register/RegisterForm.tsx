"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Heart, ShieldCheck, Briefcase, Clock, DollarSign } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "therapist" ? "THERAPIST" : "PATIENT";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole as "PATIENT" | "THERAPIST",
    specializations: "",
    yearsExperience: "",
    pricePerSession: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "فشل التسجيل. يرجى التأكد من البيانات والمحاولة مرة أخرى.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
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
            <img src="/logo.jpeg" alt="Logo" className="h-14 w-auto mx-auto object-contain mix-blend-multiply" />
          </Link>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-foreground)]">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            اختر نوع الحساب وأكمل البيانات المطلوبة للبدء
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          
          {/* Role Toggle */}
          <div className="mb-8 p-1.5 bg-slate-50 rounded-[20px] flex relative overflow-hidden border border-slate-100">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "PATIENT" })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[16px] py-3.5 text-sm font-bold transition-all relative z-10 ${
                form.role === "PATIENT"
                  ? "bg-white text-[#4318FF] shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Heart className={`h-4 w-4 ${form.role === "PATIENT" ? "text-[#4318FF]" : "text-slate-400"}`} />
              أبحث عن علاج (مريض)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "THERAPIST" })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-[16px] py-3.5 text-sm font-bold transition-all relative z-10 ${
                form.role === "THERAPIST"
                  ? "bg-emerald-500 text-white shadow-sm border border-emerald-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${form.role === "THERAPIST" ? "text-white" : "text-slate-400"}`} />
              أنا أخصائي نفسي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Common Fields Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  الاسم الكامل
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
                    placeholder={form.role === "THERAPIST" ? "د. الاسم الرباعي" : "الاسم الرباعي"}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  البريد الإلكتروني
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

            {/* Common Fields Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#4318FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-medium"
                    placeholder="••••••••"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>
            </div>

            {/* Therapist Specific Fields */}
            {form.role === "THERAPIST" && (
              <div className="pt-4 mt-6 border-t border-slate-100 animate-fade-in">
                <h3 className="text-sm font-black text-emerald-600 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> التفاصيل المهنية (كأخصائي)
                </h3>
                
                <div className="space-y-5">
                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      التخصصات الأساسية
                    </label>
                    <input
                      type="text"
                      required
                      value={form.specializations}
                      onChange={(e) => setForm({ ...form, specializations: e.target.value })}
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      placeholder="مثال: القلق، الاكتئاب، العلاقات الأسرية (افصل بينها بفاصلة)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Years of Experience */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        سنوات الخبرة
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <Clock className="h-5 w-5" />
                        </div>
                        <input
                          type="number"
                          required
                          min="0"
                          value={form.yearsExperience}
                          onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                          placeholder="مثال: 5"
                        />
                      </div>
                    </div>

                    {/* Price per session */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        سعر الجلسة المتوقع (ج.م)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <input
                          type="number"
                          required
                          min="50"
                          value={form.pricePerSession}
                          onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })}
                          className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                          placeholder="مثال: 300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    بعد إنهاء التسجيل، سيتم توجيهك للوحة التحكم. سيظل حسابك "غير موثق" حتى تقوم برفع المستندات المطلوبة ويقوم فريقنا بمراجعتها والموافقة عليها.
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
                  جاري معالجة الطلب...
                </>
              ) : (
                <>
                  {form.role === "THERAPIST" ? "تقديم طلب الانضمام كأخصائي" : "إنشاء حساب كمريض"}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-center text-slate-500 font-medium">
            بالتسجيل فإنك توافق على <Link href="/terms" className="text-[#4318FF] font-bold hover:underline">الشروط والأحكام</Link> و <Link href="/privacy" className="text-[#4318FF] font-bold hover:underline">سياسة الخصوصية</Link>
          </p>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-400 font-bold">
                لديك حساب بالفعل؟
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-2xl px-4 py-4 text-sm font-bold text-[#4318FF] border-2 border-slate-100 transition-all hover:bg-slate-50 hover:border-slate-200"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
