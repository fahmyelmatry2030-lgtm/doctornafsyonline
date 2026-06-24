"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Loader2, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token || !email) {
      setError("رابط إعادة التعيين غير مكتمل أو غير صالح. يرجى طلب رابط جديد.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      setLoading(false);
      return;
    }

    // Password strength check
    const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
    const hasNumber = /\d/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      setError("يجب أن تتكون كلمة المرور من 8 خانات على الأقل، وتحتوي على حرف واحد ورقم واحد على الأقل.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "فشل إعادة تعيين كلمة المرور.");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-[var(--color-foreground)] transition-transform hover:scale-105 font-bold">
            دكتور <span className="text-[#6366F1]">نفسي</span>
          </Link>
          
          <div className="mt-8 flex justify-center">
            <div className="bg-[#EEF2FF] p-4 rounded-full text-[#6366F1] shadow-sm mb-2">
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            تعيين كلمة مرور جديدة
          </h2>
          <p className="mt-2 text-sm text-slate-600 px-4">
            يرجى إدخال كلمة المرور الجديدة وتأكيدها لحماية حسابك.
          </p>
        </div>

        {/* Card */}
        <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium bg-white/90">
          
          {success ? (
            <div className="text-center animate-fade-in py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#10B981]/10 text-[#10B981] mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">تم تغيير كلمة المرور!</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                تم تحديث كلمة المرور الخاصة بحسابك بنجاح. سيتم تحويلك لصفحة تسجيل الدخول الآن...
              </p>
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-3.5 text-sm font-bold text-white transition-bounce hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20"
              >
                الذهاب لتسجيل الدخول فورا
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email (Read Only representation) */}
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1">
                  البريد الإلكتروني المستهدف
                </label>
                <div className="bg-slate-100/80 rounded-xl px-4 py-3 text-sm text-slate-500 font-bold text-right" dir="ltr">
                  {email || "غير معروف"}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
                    placeholder="••••••••"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
                    placeholder="••••••••"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                * يجب أن تتكون كلمة المرور من 8 خانات على الأقل وتحتوي على حرف ورقم واحد على الأقل.
              </p>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-fade-in flex items-start gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="group flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    تحديث كلمة المرور
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin" />
        <span className="text-sm font-bold text-slate-500 mt-4">جاري تحميل الصفحة...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
