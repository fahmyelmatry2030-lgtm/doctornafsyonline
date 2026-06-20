"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, Send, MessageCircle, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { PLATFORM_PHONE } from "@/lib/constants";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [content, setContent] = useState({
    contactPhone: PLATFORM_PHONE,
    contactEmail: "support@doctornafsyonline.com",
    contactAddress: "القاهرة، مصر",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
              تواصل معنا
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              نحن هنا <span className="gradient-text">لأجلك</span>
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              يسعدنا الاستماع إليك. سواء كان لديك استفسار، ملاحظة، أو تحتاج إلى مساعدة، فريقنا جاهز للرد عليك في أسرع وقت.
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="animate-fade-in-up">
            <h2 className="mb-8 text-3xl font-black text-[var(--color-foreground)]">معلومات التواصل</h2>
            <p className="mb-10 text-lg text-slate-600 leading-relaxed">
              يمكنك التواصل معنا عبر أي من القنوات التالية، وسنحرص على الرد عليك خلال أقل من 24 ساعة.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="h-6 w-6 text-[#6366F1]" />,
                  title: "البريد الإلكتروني",
                  info: content.contactEmail,
                  desc: "للاستفسارات العامة والدعم التقني",
                  bg: "from-[#6366F1] to-[#8B5CF6]",
                },
                {
                  icon: <Phone className="h-6 w-6 text-[#10B981]" />,
                  title: "رقم الهاتف",
                  info: content.contactPhone,
                  desc: "متاح من 9 صباحاً حتى 9 مساءً بتوقيت مكة",
                  bg: "from-[#10B981] to-[#059669]",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-[#F59E0B]" />,
                  title: "المقر الرئيسي",
                  info: content.contactAddress,
                  desc: "نخدم جميع أنحاء الوطن العربي رقمياً",
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
                <h3 className="font-bold text-xl text-white">متوسط وقت الرد</h3>
              </div>
              <p className="opacity-95 text-[#A5B4FC] relative z-10 leading-relaxed">
                نحن ندرك أهمية وقتك، لذلك نلتزم بالرد على كافة رسائلك خلال مدة أقصاها ساعة واحدة في أوقات العمل الرسمية.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-8 shadow-premium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="mb-2 text-2xl font-bold text-[var(--color-foreground)]">أرسل لنا رسالة</h2>
            <p className="mb-8 text-slate-600">الرجاء تعبئة النموذج وسنتواصل معك قريباً.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    الاسم الكريم
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300"
                    placeholder="example@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">
                  الموضوع
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm hover:border-slate-300 appearance-none"
                  >
                    <option>استفسار عام</option>
                    <option>مشكلة في الحجز أو الدفع</option>
                    <option>اقتراح تحسين</option>
                    <option>طلب انضمام كأخصائي</option>
                    <option>أخرى</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                  الرسالة
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none shadow-sm hover:border-slate-300"
                  placeholder="كيف يمكننا مساعدتك؟"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-4 font-bold text-white transition-bounce hover:shadow-lg hover:shadow-[#6366F1]/30 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/20"
              >
                إرسال الرسالة
                <Send className="h-5 w-5 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
              </button>

              {submitted && (
                <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 p-4 flex items-center gap-3 text-[#059669] animate-fade-in">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                  <p className="font-semibold text-sm">
                    شكراً لك! تم استلام رسالتك بنجاح. سنرد عليك في أقرب وقت.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FAQ Link */}
        <section className="mt-24 card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-12 text-center animate-fade-in-up">
          <h2 className="mb-4 text-3xl font-black text-[var(--color-foreground)]">
            تبحث عن إجابة سريعة؟
          </h2>
          <p className="mb-8 text-lg text-slate-600 max-w-2xl mx-auto">
            قمنا بتجميع إجابات وافية لأكثر الأسئلة شيوعاً. تفضل بزيارة صفحة الأسئلة الشائعة، فقد تجد ضالتك هناك فوراً.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-3 rounded-full bg-[#EEF2FF] px-8 py-4 font-bold text-[#6366F1] transition-premium hover:bg-[#E0E7FF] hover:-translate-y-1"
          >
            تصفح الأسئلة الشائعة
            <span className="text-xl">←</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
