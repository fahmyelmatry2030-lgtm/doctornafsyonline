import { TherapistCard } from "@/components/TherapistCard";
import { SPECIALIZATIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Filter } from "lucide-react";
import { getWebsiteContent } from "@/app/admin/settings/actions";

type Props = {
  searchParams: Promise<{ specialization?: string }>;
};

export default async function TherapistsPage({ searchParams }: Props) {
  const { specialization } = await searchParams;

  const content = await getWebsiteContent();

  const therapists = await prisma.user.findMany({
    where: {
      role: "THERAPIST",
      therapistProfile: {
        isAvailable: true,
        ...(specialization && {
          specializations: { contains: specialization },
        }),
      },
    },
    include: { therapistProfile: true },
    orderBy: { therapistProfile: { rating: "desc" } },
  });

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-surface-warm)] py-20 md:py-28">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#E0E7FF] blur-3xl animate-float"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center z-10">
          <div className="max-w-3xl mx-auto animate-fade-in-up stagger-1">
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#312E81] shadow-premium">
              <Users className="h-4 w-4 text-[#6366F1]" />
              {content.therapistsHeroBadge || "نخبة الأخصائيين"}
            </span>
            <h1 className="mb-6 text-4xl font-black leading-tight text-[var(--color-foreground)] md:text-5xl animate-fade-in-up stagger-2">
              {content.therapistsHeroTitle || "تحدث مع"} <span className="gradient-text">{content.therapistsHeroTitleGradient || "الخبراء المعتمدين"}</span>
            </h1>
            <p className="text-lg leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              {content.therapistsHeroSubtitle || "نخبة من الأخصائيين النفسيين ذوي الكفاءة العالية، جاهزون لمساعدتك في التغلب على التحديات والمضي قدماً في حياتك."}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-16 relative z-10">
        
        {/* Filter Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#EEF2FF] p-2 rounded-xl text-[#6366F1]">
              <Filter className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">{content.therapistsFilterTitle || "تصفية حسب التخصص"}</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href="/therapists"
              className={`rounded-full px-6 py-3 font-semibold transition-premium hover:-translate-y-1 ${
                !specialization
                  ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-premium"
                  : "glass text-slate-700 hover:shadow-md border border-[var(--color-border-soft)]"
              }`}
            >
              جميع التخصصات
            </Link>
            {SPECIALIZATIONS.map((spec) => (
              <Link
                key={spec}
                href={`/therapists?specialization=${encodeURIComponent(spec)}`}
                className={`rounded-full px-6 py-3 font-semibold transition-premium hover:-translate-y-1 ${
                  specialization === spec
                    ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-premium"
                    : "glass text-slate-700 hover:shadow-md border border-[var(--color-border-soft)]"
                }`}
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        {therapists.length === 0 ? (
          <div className="card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-16 text-center animate-fade-in shadow-premium">
            <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-warm)] text-[#6366F1]">
              <Users className="h-10 w-10 opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">لا يوجد أخصائيين متاحين</h3>
            <p className="text-slate-500 text-lg">لم نتمكن من العثور على أخصائيين في هذا التخصص حالياً. يرجى تجربة تخصص آخر.</p>
            <Link href="/therapists" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-6 py-3 font-bold text-[#6366F1] transition-colors hover:bg-[#E0E7FF]">
              عرض كل الأخصائيين
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {therapists.map((t, idx) =>
              t.therapistProfile ? (
                <div key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <TherapistCard
                    id={t.id}
                    name={t.name}
                    bio={t.therapistProfile.bio}
                    specializations={t.therapistProfile.specializations}
                    pricePerSession={t.therapistProfile.pricePerSession}
                    yearsExperience={t.therapistProfile.yearsExperience}
                    rating={t.therapistProfile.rating}
                    reviewCount={t.therapistProfile.reviewCount}
                    isVerified={t.therapistProfile.isVerified}
                    isOnline={t.isOnline}
                    imageUrl={t.avatar || undefined}
                  />
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
