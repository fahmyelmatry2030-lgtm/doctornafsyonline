"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send, MessageCircle, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { PLATFORM_PHONE } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "استفسار عام",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [content, setContent] = useState({
    contactPhone: PLATFORM_PHONE,
    contactEmail: "support@doctornafsyonline.com",
    contactAddress: "القاهرة، مصر",
  });
  
  const t = useTranslations("Contact");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setContent(data);
        }
      })
      .catch((err) => console.error("Failed to load contact info:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formState.name,
          userEmail: formState.email,
          subject: formState.subject,
          message: formState.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setSubmitError(data.error || "حدث خطأ أثناء الإرسال");
      }
    } catch {
      setSubmitError("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-surface-warm)] py-24 md:py-32">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center z-10">
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-1">
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#312E81] shadow-premium">
              <MessageCircle className="h-4 w-4 text-[#6366F1]" />
              {t("heroBadge")}
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              {t("heroTitle1")} <span className="gradient-text">{t("heroTitle2")}</span>
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              {t("heroSubtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="animate-fade-in-up">
            <h2 className="mb-8 text-3xl font-black text-[var(--color-foreground)]">{t("infoTitle")}</h2>
            <p className="mb-10 text-lg text-slate-600 leading-relaxed">
              {t("infoDesc")}
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="h-6 w-6 text-[#6366F1]" />,
                  title: t("emailTitle"),
                  info: content.contactEmail,
                  desc: t("emailDesc"),
                  bg: "from-[#6366F1] to-[#8B5CF6]",
                },
                {
                  icon: <Phone className="h-6 w-6 text-[#10B981]" />,
                  title: t("phoneTitle"),
                  info: content.contactPhone,
                  desc: t("phoneDesc"),
                  bg: "from-[#10B981] to-[#059669]",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-[#F59E0B]" />,
                  title: t("addressTitle"),
                  info: content.contactAddress,
                  desc: t("addressDesc"),
                  bg: "from-[#F59E0B] to-[#D97706]",
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className="card-glow glass flex items-start gap-5 rounded-3xl border border-[var(--color-border-soft)] p-6 transition-premium hover:shadow-premium-hover hover:-translate-y-1"
                >
                  <div className={`mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.bg} text-white shadow-md transition-bounce hover:scale-110`}>
                    <div className="bg-white/20 p-2.5 rounded-lg text-white backdrop-blur-sm">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-[var(--color-foreground)]">{item.title}</h3>
                    <p className="mb-1 font-semibold text-[#6366F1]">{item.info}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Response Time */}
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#1E1B3A] to-[#312E81] p-8 text-white shadow-premium relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#6366F1] rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <Clock className="h-8 w-8 text-[#C7D2FE] animate-pulse-soft" />
                <h3 className="font-bold text-xl text-white">{t("responseTimeTitle")}</h3>
              </div>
              <p className="opacity-95 text-[#A5B4FC] relative z-10 leading-relaxed">
                {t("responseTimeDesc")}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="mb-2 text-2xl font-bold text-[var(--color-foreground)]">{t("formTitle")}</h2>
            <p className="mb-8 text-slate-600">{t("formDesc")}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">
                  {t("subjectLabel")}
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300 appearance-none"
                  >
                    <option>{t("subjectOpt1")}</option>
                    <option>{t("subjectOpt2")}</option>
                    <option>{t("subjectOpt3")}</option>
                    <option>{t("subjectOpt4")}</option>
                    <option>{t("subjectOpt5")}</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                  {t("messageLabel")}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none shadow-sm hover:border-slate-300"
                  placeholder={t("messagePlaceholder")}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-4 font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20 disabled:opacity-70"
              >
                {submitLoading ? t("sending") : (
                  <>
                    {t("sendBtn")}
                    <Send className="h-5 w-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-red-600 animate-fade-in">
                  <p className="font-semibold text-sm">{submitError}</p>
                </div>
              )}

              {submitted && (
                <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 p-4 flex items-center gap-3 text-[#059669] animate-fade-in">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                  <p className="font-semibold text-sm">
                    {t("successMsg")}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FAQ Link */}
        <section className="mt-24 card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-12 text-center animate-fade-in-up">
          <h2 className="mb-4 text-3xl font-black text-[var(--color-foreground)]">
            {t("faqSectionTitle")}
          </h2>
          <p className="mb-8 text-lg text-slate-600 max-w-2xl mx-auto">
            {t("faqSectionDesc")}
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-3 rounded-full bg-[#EEF2FF] px-8 py-4 font-bold text-[#6366F1] transition-premium hover:bg-[#E0E7FF] hover:-translate-y-1"
          >
            {t("faqLink")}
            <span className="text-xl">←</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
