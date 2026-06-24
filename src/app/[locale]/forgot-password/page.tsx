"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || t("errorGeneric"));
      }
    } catch (err) {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-[var(--color-foreground)] transition-transform hover:scale-105">
            Doctor <span className="text-[#6366F1]">Nafsy</span>
          </Link>
          
          <div className="mt-8 flex justify-center">
            <div className="bg-[#EEF2FF] p-4 rounded-full text-[#6366F1] shadow-sm mb-2">
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 px-4">
            {t("subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium">
          
          {submitted ? (
            <div className="text-center animate-fade-in py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#10B981]/10 text-[#10B981] mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t("checkEmailTitle")}</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {t("checkEmailDesc")} <span className="font-semibold text-slate-800" dir="ltr">{email}</span>
              </p>
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-3.5 text-sm font-bold text-white transition-bounce hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20"
              >
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t("emailLabel")}
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
                    placeholder={t("emailPlaceholder")}
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
                disabled={loading || !email}
                className="group flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-4 py-4 text-sm font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    {t("sendLinkBtn")}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                {t("backToLogin")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
