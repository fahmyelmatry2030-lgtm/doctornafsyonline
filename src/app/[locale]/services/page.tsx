import { HeartHandshake, Shield, Video, Phone, MessageCircle, Clock, CheckCircle2, Zap, Award } from "lucide-react";
import Link from "next/link";

import { getTranslations } from "next-intl/server";

export default async function ServicesPage() {
  const t = await getTranslations("Services");

  const services = [
    {
      icon: Video,
      title: t("title1"),
      description: t("desc1"),
      benefits: [t("ben1_1"), t("ben1_2"), t("ben1_3")],
      color: "from-[#6366F1] to-[#8B5CF6]",
    },
    {
      icon: Phone,
      title: t("title2"),
      description: t("desc2"),
      benefits: [t("ben2_1"), t("ben2_2"), t("ben2_3")],
      color: "from-[#F59E0B] to-[#F97316]",
    },
    {
      icon: MessageCircle,
      title: t("title3"),
      description: t("desc3"),
      benefits: [t("ben3_1"), t("ben3_2"), t("ben3_3")],
      color: "from-[#14B8A6] to-[#0D9488]",
    },
  ];

  const reasons = [
    {
      icon: Shield,
      title: t("reasonTitle1"),
      description: t("reasonDesc1"),
    },
    {
      icon: HeartHandshake,
      title: t("reasonTitle2"),
      description: t("reasonDesc2"),
    },
    {
      icon: Clock,
      title: t("reasonTitle3"),
      description: t("reasonDesc3"),
    },
  ];

  const features = [
    { title: t("featTitle1"), description: t("featDesc1") },
    { title: t("featTitle2"), description: t("featDesc2") },
    { title: t("featTitle3"), description: t("featDesc3") },
    { title: t("featTitle4"), description: t("featDesc4") },
  ];
  return (
    <div className="bg-[var(--color-background)]">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-surface-warm)] py-24 md:py-32">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#FEF3C7] blur-3xl animate-float"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center z-10">
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-1">
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#B45309] shadow-premium">
              <Zap className="h-4 w-4 text-[#F59E0B]" />
              {t("heroTag")}
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              {t("heroTitle1")} <span className="gradient-text-warm">{t("heroTitle2")}</span> {t("heroTitle3")}
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              {t("heroDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        {/* Services Cards */}
        <section className="mb-24">
          <div className="mb-16 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">🎯</span> {t("servicesTag")}
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t("servicesTitle1")} <span className="gradient-text">{t("servicesTitle2")}</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              {t("servicesDesc")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden shadow-premium transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up flex flex-col"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  {/* Top Color Bar */}
                  <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>

                  <div className="p-8 flex-1 flex flex-col">
                    {/* Icon */}
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg animate-pulse-glow`}>
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="mb-4 text-2xl font-bold text-[var(--color-foreground)] transition-colors">
                      {service.title}
                    </h3>
                    <p className="mb-8 text-slate-600 leading-relaxed flex-1">
                      {service.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-8 pt-6 border-t border-[var(--color-border-soft)]">
                      {service.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                          <span className="font-medium text-[var(--color-foreground)]">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href="/therapists"
                      className={`inline-block w-full text-center rounded-xl bg-gradient-to-r ${service.color} px-4 py-4 font-bold text-white transition-bounce hover:shadow-lg hover:scale-105`}
                    >
                      {t("bookBtn")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why We're Different */}
        <section className="mb-24 card-glow glass-strong rounded-3xl p-8 md:p-12 shadow-premium animate-fade-in">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">✨</span> {t("uniquenessTag")}
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t("uniquenessTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              {t("uniquenessDesc")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="glass rounded-2xl p-8 border border-[var(--color-border-soft)] hover:border-[#8B5CF6] transition-premium hover:shadow-md animate-fade-in-up group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-md transition-bounce group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[var(--color-foreground)] group-hover:text-[#6366F1] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-24">
          <div className="mb-16 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">🌟</span> {t("addedValueTag")}
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              {t("addedValueTitle")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 text-center transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-4 mx-auto flex items-center justify-center w-12 h-12 bg-[#EEF2FF] text-[#6366F1] rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="mb-2 font-bold text-[var(--color-foreground)] text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Info */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E1B3A] via-[#312E81] to-[#1E1B3A] animate-gradient p-12 md:p-16 text-white shadow-premium-lg">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#6366F1] blur-[100px] opacity-40 animate-float-slow pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center justify-between">
            <div className="max-w-xl text-center md:text-right">
              <div className="mb-6 inline-block bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-xl animate-pulse-glow">
                <Award className="h-10 w-10 text-[#C7D2FE]" />
              </div>
              <h2 className="mb-4 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">{t("pricingTitle")}</h2>
              <p className="mb-8 text-xl opacity-95 leading-relaxed text-[#A5B4FC]">
                {t("pricingDesc")}
              </p>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#312E81] transition-bounce hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                {t("pricingCta")}
                <span className="bg-[#EEF2FF] text-[#6366F1] rounded-full p-1">←</span>
              </Link>
            </div>

            <div className="grid gap-4 w-full md:w-auto">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/20 shadow-xl transform transition-premium hover:-translate-y-1 hover:bg-white/15">
                <div className="text-lg font-medium text-[#C7D2FE] mb-1">{t("sessionsStart")}</div>
                <div className="text-4xl font-black">300 <span className="text-2xl font-bold">{t("currency")}</span></div>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/20 shadow-xl transform transition-premium hover:-translate-y-1 hover:bg-white/15">
                <div className="text-lg font-medium text-[#C7D2FE] mb-1">{t("hiddenFees")}</div>
                <div className="text-4xl font-black">{t("zero")}</div>
              </div>
              <div className="rounded-2xl bg-[#6366F1] p-6 shadow-[0_0_30px_rgba(99,102,241,0.5)] transform transition-premium hover:-translate-y-1">
                <div className="text-lg font-medium text-[#C7D2FE] mb-1">{t("paymentTransparency")}</div>
                <div className="text-4xl font-black">100%</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
