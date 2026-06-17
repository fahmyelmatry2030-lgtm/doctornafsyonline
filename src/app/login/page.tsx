"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { authenticate } from "./actions";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await authenticate(email, password);
      if (result) {
        setError(result);
      }
    });
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo / Brand Placeholder */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img src="/logo.jpeg" alt="Logo" className="h-16 w-auto object-contain rounded-xl mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
            مرحباً بعودتك
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            سجل دخولك للمتابعة إلى حسابك الخاص
          </p>
        </div>

        {/* Login Card */}
        <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                  placeholder="example@email.com"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-12 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
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
              disabled={isPending}
              className="group flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-soft)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/80 backdrop-blur-sm px-4 text-slate-500 rounded-full border border-[var(--color-border-soft)] shadow-sm">
                مستخدم جديد؟
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="inline-flex w-full justify-center rounded-xl glass px-4 py-3.5 text-sm font-bold text-[#6366F1] border border-[#6366F1]/20 transition-premium hover:bg-[#EEF2FF] hover:border-[#6366F1]/40"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
