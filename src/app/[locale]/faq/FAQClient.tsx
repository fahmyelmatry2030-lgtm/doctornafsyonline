"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import LinkNext from "next/link";
import { useTranslations } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  name: string;
  icon: string;
  color: string;
}

interface FAQClientProps {
  faqHeroBadge: string;
  faqHeroTitle: string;
  faqHeroSubtitle: string;
  faqItems: FAQItem[];
  faqCategories: FAQCategory[];
}

export default function FAQClient({
  faqHeroBadge,
  faqHeroTitle,
  faqHeroSubtitle,
  faqItems,
  faqCategories,
}: FAQClientProps) {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const t = useTranslations("FAQ");

  const filteredFaqs = selectedCategory
    ? faqItems.filter((faq) => faq.category === selectedCategory)
    : faqItems;

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
              <HelpCircle className="h-4 w-4 text-[#6366F1]" />
              {faqHeroBadge}
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              {faqHeroTitle}
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              {faqHeroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-4xl px-4 py-20 relative z-10">
        {/* Category Filter */}
        <section className="mb-16 animate-fade-in">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-8 py-3.5 font-bold transition-premium hover:-translate-y-1 ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-premium"
                  : "glass text-slate-700 hover:shadow-md"
              }`}
            >
              {t("allBtn")}
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-8 py-3.5 font-bold transition-premium hover:-translate-y-1 ${
                  selectedCategory === cat.name
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-premium`
                    : "glass text-slate-700 hover:shadow-md border border-[var(--color-border-soft)]"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-24">
          <div className="space-y-6">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className={`glass card-glow rounded-3xl border border-[var(--color-border-soft)] overflow-hidden transition-premium hover:shadow-premium-hover animate-fade-in-up ${expandedId === idx ? 'shadow-premium ring-2 ring-[#8B5CF6]/20' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                  className="w-full px-8 py-6 text-right flex items-center justify-between transition-colors focus:outline-none"
                >
                  <div className="flex items-start gap-5 flex-1 pr-2">
                    <div className="mt-0.5 text-2xl animate-pulse-soft text-[#6366F1]">❓</div>
                    <h3 className={`text-lg md:text-xl font-bold transition-colors leading-relaxed ${expandedId === idx ? 'text-[#6366F1]' : 'text-[var(--color-foreground)]'}`}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-warm)] transition-transform duration-500 ease-in-out ${expandedId === idx ? "rotate-180 bg-[#EEF2FF]" : ""}`}>
                    <ChevronDown className={`h-5 w-5 ${expandedId === idx ? "text-[#6366F1]" : "text-slate-500"}`} />
                  </div>
                </button>

                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedId === idx ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="border-t border-[var(--color-border-soft)] px-8 py-8 bg-[var(--color-surface-warm)] mr-16 rounded-bl-3xl">
                    <p className="text-slate-700 leading-relaxed text-lg mb-6">{faq.answer}</p>
                    <div className="inline-block rounded-full bg-white border border-[var(--color-border-soft)] shadow-sm px-4 py-1.5 text-xs font-bold text-[#8B5CF6] tracking-wider">
                      # {faq.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 glass rounded-3xl border border-[var(--color-border-soft)]">
                <p className="text-xl text-slate-500">{t("noQuestions")}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-[#1E1B3A] p-12 md:p-16 text-center text-white shadow-premium-lg mb-20">
          <div className="absolute inset-0 animate-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #1E1B3A, #312E81, #1E1B3A)' }}></div>
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#6366F1] blur-[100px] opacity-30 animate-float-slow pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-6 inline-block bg-white/10 p-5 rounded-full backdrop-blur-md border border-white/20 shadow-xl animate-pulse-glow">
              <MessageCircle className="h-10 w-10 text-[#C7D2FE]" />
            </div>
            <h2 className="mb-4 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">{t("notAnsweredTitle")}</h2>
            <p className="mb-10 max-w-2xl mx-auto text-xl opacity-95 text-[#A5B4FC] leading-relaxed">
              {t("notAnsweredDesc")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center">
              <LinkNext
                href="/contact"
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-[#312E81] transition-bounce hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                {t("contactSupportBtn")}
                <span className="bg-[#EEF2FF] text-[#6366F1] rounded-full p-1">←</span>
              </LinkNext>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <div className="mb-12 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">🚀</span> {t("nextStepsTag")}
            </p>
            <h2 className="mb-4 text-3xl font-black text-[var(--color-foreground)]">{t("nextStepsTitle")}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: t("step1Title"),
                desc: t("step1Desc"),
                href: "/therapists",
              },
              {
                icon: "📋",
                title: t("step2Title"),
                desc: t("step2Desc"),
                href: "/therapists",
              },
              {
                icon: "✨",
                title: t("step3Title"),
                desc: t("step3Desc"),
                href: "/login",
              },
            ].map((item, i) => (
              <LinkNext
                key={`${item.href}-${item.title}-${i}`}
                href={item.href}
                className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 text-center transition-premium hover:shadow-premium-hover hover:-translate-y-2 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="mb-5 mx-auto flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm text-4xl transition-bounce group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-foreground)] group-hover:text-[#6366F1] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </LinkNext>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
