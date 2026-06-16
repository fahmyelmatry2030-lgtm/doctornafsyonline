import { TherapistCard } from "@/components/TherapistCard";
import { SPECIALIZATIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ specialization?: string }>;
};

export default async function TherapistsPage({ searchParams }: Props) {
  const { specialization } = await searchParams;

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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          الأخصائيين النفسيين
        </h1>
        <p className="text-slate-600">
          اختر الأخصائي المناسب لاحتياجاتك
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/therapists"
          className={`rounded-full px-4 py-2 text-sm transition ${
            !specialization
              ? "bg-teal-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          الكل
        </Link>
        {SPECIALIZATIONS.map((spec) => (
          <Link
            key={spec}
            href={`/therapists?specialization=${encodeURIComponent(spec)}`}
            className={`rounded-full px-4 py-2 text-sm transition ${
              specialization === spec
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {spec}
          </Link>
        ))}
      </div>

      {therapists.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <p className="text-slate-500">لا يوجد أخصائيين في هذا التخصص حالياً</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {therapists.map((t) =>
            t.therapistProfile ? (
              <TherapistCard
                key={t.id}
                id={t.id}
                name={t.name}
                bio={t.therapistProfile.bio}
                specializations={t.therapistProfile.specializations}
                pricePerSession={t.therapistProfile.pricePerSession}
                yearsExperience={t.therapistProfile.yearsExperience}
                rating={t.therapistProfile.rating}
                reviewCount={t.therapistProfile.reviewCount}
                isVerified={t.therapistProfile.isVerified}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
