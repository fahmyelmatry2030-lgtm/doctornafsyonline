import Link from "next/link";
import { BookOpen, Clock, ArrowRight, TrendingUp, Heart, Brain, Sparkles, Star, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const prefix = locale === "en" ? "/en" : "/ar";
  const t = await getTranslations("Blog");
  const { prisma } = await import("@/lib/prisma");
  const posts = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  const tips = [
    { icon: <Brain className="w-6 h-6" />, title: t("tip1Title"), desc: t("tip1Desc") },
    { icon: <Star className="w-6 h-6" />, title: t("tip2Title"), desc: t("tip2Desc") },
    { icon: <TrendingUp className="w-6 h-6" />, title: t("tip3Title"), desc: t("tip3Desc") },
    { icon: <Heart className="w-6 h-6" />, title: t("tip4Title"), desc: t("tip4Desc") },
  ];

  return (
    <div className="bg-[var(--color-background)] min-h-screen" dir="rtl">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #1E1B3A 0%, #312E81 50%, #065F46 100%)" }}
        />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366F1] blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500 blur-[150px] opacity-15 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 z-10">
          <div className="max-w-3xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-emerald-300" />
              {t("heroBadge")}
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl lg:text-7xl leading-tight">
              {t("heroTitle1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                {t("heroTitle2")}
              </span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
              {t("heroDesc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[t("catPractical"), t("catHealth"), t("catBeginner")].map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-white/10 border border-white/20 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ARTICLES GRID ============ */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-sm font-bold text-[#6366F1] uppercase tracking-widest flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> {t("latestArticles")}
              </span>
              <h2 className="text-4xl font-black text-slate-900">{t("chooseArticle")}</h2>
            </div>
            <p className="text-slate-500 max-w-sm text-right">
              {t("addRegularly")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => {
              const bgColors = ["from-[#6366F1] to-[#8B5CF6]", "from-teal-500 to-emerald-600", "from-violet-500 to-purple-600", "from-pink-500 to-rose-600", "from-blue-500 to-cyan-600"];
              const textColors = ["text-[#6366F1]", "text-teal-700", "text-violet-700", "text-pink-700", "text-blue-700"];
              const colorIdx = idx % bgColors.length;
              return (
              <Link
                key={post.slug}
                href={`${prefix}/blog/${encodeURIComponent(post.slug)}`}
                className="group flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Card Header */}
                <div className={`relative h-44 bg-gradient-to-br ${bgColors[colorIdx]} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 0%, transparent 60%)' }} />
                  <span className="text-6xl drop-shadow-lg group-hover:scale-125 transition-transform duration-500">
                    {post.icon || "📝"}
                  </span>
                  <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-white ${textColors[colorIdx]}`}>
                    {post.category || "General"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="mb-3 text-xl font-black text-slate-900 leading-snug group-hover:text-[#6366F1] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm flex-1 mb-6 line-clamp-3">
                    {post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600">
                        <User className="h-3 w-3" />
                      </div>
                      {post.author || "إدارة نَفسي"}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                        <Clock className="h-4 w-4" />
                        {post.readTime || "5 min"}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#6366F1] group-hover:gap-4 transition-all text-sm">
                        {t("readNow")}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      {/* ============ TIPS SECTION ============ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <span className="text-sm font-bold text-[#6366F1] uppercase tracking-widest">📚 {t("whatYouFind")}</span>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{t("contentStrategy")}</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              {t("contentStrategyDesc")}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip, idx) => (
              <div
                key={tip.title}
                className="group rounded-3xl border-2 border-slate-100 bg-[var(--color-background)] p-8 text-center hover:border-[#6366F1]/30 hover:bg-[#EEF2FF]/40 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  {tip.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-slate-900">{tip.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-12 px-4 md:px-8">
        <div
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-white text-center"
          style={{ background: "linear-gradient(135deg, #1E1B3A 0%, #312E81 60%, #1E1B3A 100%)" }}
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#6366F1] rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#8B5CF6] rounded-full blur-3xl opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <BookOpen className="mx-auto mb-6 w-16 h-16 text-[#C7D2FE] opacity-80" />
            <h2 className="mb-4 text-4xl font-black">{t("newContent")}</h2>
            <p className="mb-8 text-[#A5B4FC] text-lg max-w-2xl mx-auto leading-relaxed">
              {t("newContentDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`${prefix}/contact`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[#312E81] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                {t("contactBtn")}
              </Link>
              <Link
                href={`${prefix}/faq`}
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#C7D2FE] transition-colors"
              >
                {t("faqLink")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
