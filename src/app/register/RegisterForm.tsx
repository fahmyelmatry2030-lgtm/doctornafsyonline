"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, Heart, ShieldCheck } from "lucide-react";

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

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-3xl font-black text-[var(--color-foreground)] transition-transform hover:scale-105">
            دكتور <span className="text-[#6366F1]">نفسي</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            خطوتك الأولى نحو حياة أكثر توازناً وصحة نفسية
          </p>
        </div>

        {/* Card */}
        <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium">
          
          {/* Role Toggle */}
          <div className="mb-8 p-1.5 bg-[#EEF2FF] rounded-2xl flex relative overflow-hidden border border-[#E0E7FF]">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "PATIENT" })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all relative z-10 ${
                form.role === "PATIENT"
                  ? "bg-white text-[#6366F1] shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Heart className={`h-4 w-4 ${form.role === "PATIENT" ? "text-[#6366F1]" : "text-slate-400"}`} />
              أبحث عن علاج
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "THERAPIST" })}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all relative z-10 ${
                form.role === "THERAPIST"
                  ? "bg-white text-[#10B981] shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${form.role === "THERAPIST" ? "text-[#10B981]" : "text-slate-400"}`} />
              أنا أخصائي نفسي
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                  placeholder="الاسم الرباعي"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                  placeholder="example@email.com"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>
            </div>

            {/* Phone & Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                    className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                    className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder="••••••••"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-fade-in">
                <p className="text-sm text-red-600 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group flex w-full justify-center items-center gap-2 rounded-xl px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                form.role === "THERAPIST" 
                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[#10B981]/30 focus:ring-[#10B981]/20" 
                  : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[#6366F1]/30 focus:ring-[#6366F1]/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                <>
                  إنشاء الحساب
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-center text-slate-500">
            بالتسجيل فإنك توافق على <Link href="/terms" className="text-[#6366F1] hover:underline">الشروط والأحكام</Link> و <Link href="/privacy" className="text-[#6366F1] hover:underline">سياسة الخصوصية</Link>
          </p>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-soft)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 backdrop-blur-sm px-4 text-slate-500 rounded-full border border-[var(--color-border-soft)] shadow-sm">
                لديك حساب بالفعل؟
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-xl glass px-4 py-3.5 text-sm font-bold text-[#6366F1] border border-[#6366F1]/20 transition-premium hover:bg-[#EEF2FF] hover:border-[#6366F1]/40"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
