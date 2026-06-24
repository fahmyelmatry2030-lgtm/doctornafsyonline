import { HeartHandshake, Shield, Users, CheckCircle2, Target, Lightbulb } from "lucide-react";
import Link from "next/link";

import { getTranslations } from "next-intl/server";
import { getWebsiteContent } from "@/app/[locale]/admin/settings/actions";

export default async function AboutPage() {
  const content = await getWebsiteContent();
  const t = await getTranslations("About");

  const values = [
    {
      title: t("title"),
      description: t("desc"),
      icon: HeartHandshake,
    },
    {
      title: t("title2"),
      description: t("desc2"),
      icon: Users,
    },
    {
      title: t("title3"),
      description: t("desc3"),
      icon: Shield,
    },
  ];

  const whyChooseUs = [
    { title: t("whyTitle1"), desc: t("whyDesc1") },
    { title: t("whyTitle2"), desc: t("whyDesc2") },
    { title: t("whyTitle3"), desc: t("whyDesc3") },
    { title: t("whyTitle4"), desc: t("whyDesc4") },
  ];



  return (
    <div className="bg-[var(--color-background)]">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-surface-warm)] py-24 md:py-32">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 left-1/3 h-96 w-96 rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-[var(--color-border-soft)] blur-3xl animate-float"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center z-10">
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-1">
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#312E81] shadow-premium">
              <Target className="h-4 w-4 text-[#8B5CF6]" />
              {content.aboutTitle}
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              {content.aboutSubtitle}
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              {content.aboutContent}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        {/* About Section */}
        <section className="mb-24 card-glow glass-strong rounded-3xl p-8 md:p-12 shadow-premium animate-fade-in">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center gap-2">
                <span className="text-xl">💡</span> {t("vision")}
              </p>
              <h2 className="mb-6 text-4xl font-black text-[var(--color-foreground)] leading-tight">
                {t("heading")}
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                {t("p1")}<span className="font-bold text-[#6366F1]">{t("p1bold")}</span>{t("p1_2")}
              </p>
              <p className="mb-8 text-lg leading-relaxed text-slate-600">
                {t("p2")}
              </p>
              <div className="flex flex-col gap-4">
                {[t("bullet1"), t("bullet2"), t("bullet3")].map((item, idx) => (
                  <div key={item} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                    <div className="bg-[#EEF2FF] rounded-full p-1">
                      <CheckCircle2 className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    </div>
                    <span className="font-semibold text-[var(--color-foreground)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full blur-3xl opacity-20 animate-pulse-glow"></div>
              <div className="relative h-96 w-full rounded-3xl bg-gradient-to-br from-[#1E1B3A] to-[#312E81] overflow-hidden shadow-premium-lg flex items-center justify-center transform transition-premium hover:scale-[1.02]">
                <div className="absolute inset-0 opacity-20 hero-grid pointer-events-none"></div>
                <div className="text-white text-9xl filter drop-shadow-xl animate-float">🏥</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-24">
          <div className="mb-16 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">✨</span> {t("valuesHeading")}
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t("valuesTitle1")} <span className="gradient-text">{t("valuesTitle2")}</span> {t("valuesTitle3")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              {t("valuesDesc")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-10 shadow-premium transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-lg animate-pulse-glow transition-bounce hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-[var(--color-foreground)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-24 relative overflow-hidden rounded-3xl shadow-premium-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E1B3A] via-[#312E81] to-[#1E1B3A] animate-gradient"></div>
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#6366F1] blur-[100px] opacity-40 animate-float-slow pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#8B5CF6] blur-[100px] opacity-30 animate-float pointer-events-none"></div>
          
          <div className="relative p-12 md:p-16 text-white z-10 flex flex-col items-center text-center">
            <div className="mb-6 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-xl animate-pulse-glow">
              <Lightbulb className="h-12 w-12 text-[#C7D2FE]" />
            </div>
            <h2 className="mb-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">{t("futureVision")}</h2>
            <p className="mb-10 max-w-3xl text-xl leading-relaxed text-[#A5B4FC]">
              {t("futureDesc")}
            </p>
            <Link
              href="/therapists"
              className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#312E81] transition-bounce hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
            >
              {t("cta")}
              <span className="bg-[#EEF2FF] text-[#6366F1] rounded-full p-1">←</span>
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="pb-12">
          <div className="mb-16 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">🎯</span> {t("competitiveAdvantage")}
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">{t("whyChooseUs")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              {t("whyChooseUsDesc")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, idx) => (
              <div
                key={item.title}
                className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 text-center transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-5 mx-auto flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white rounded-2xl shadow-md transition-bounce hover:scale-110">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
