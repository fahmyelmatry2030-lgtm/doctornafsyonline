"use client";

import Link from "next/link";
import { Star, BadgeCheck, Clock } from "lucide-react";
import { formatPrice, parseSpecializations } from "@/lib/constants";

type TherapistCardProps = {
  id: string;
  name: string;
  bio: string;
  specializations: string;
  pricePerSession: number;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isOnline?: boolean;
  imageUrl?: string;
};

export function TherapistCard({
  id,
  name,
  bio,
  specializations,
  pricePerSession,
  yearsExperience,
  rating,
  reviewCount,
  isVerified,
  isOnline,
  imageUrl,
}: TherapistCardProps) {
  const specs = parseSpecializations(specializations).slice(0, 3);

  return (
    <article className="group flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full">
        <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50 border-4 border-white">
          <img
            src={imageUrl ? encodeURI(decodeURI()) : "/therapist-placeholder.png"}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<span class="flex h-full w-full items-center justify-center text-3xl font-bold text-white">${name.charAt(0)}</span>`;
            }}
          />
          {isOnline && (
            <div className="absolute top-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" title="متصل الآن" />
          )}
        </div>
        {isVerified && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            معتمد
          </span>
        )}
      </div>

      <h3 className="mb-2 text-lg font-bold text-slate-900">{name}</h3>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)} ({reviewCount})
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {yearsExperience} سنوات
        </span>
      </div>

      <p className="mb-5 min-h-[3rem] text-sm leading-relaxed text-slate-600">
        {bio.length > 150 ? `${bio.slice(0, 150)}...` : bio}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {specs.map((spec) => (
          <span
            key={spec}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            {spec}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="font-bold text-slate-900">
          {formatPrice(pricePerSession)}
          <span className="text-xs font-normal text-slate-500"> / جلسة</span>
        </span>
        <Link
          href={`/therapists/${id}`}
          className="rounded-full bg-gradient-to-r from-emerald-700 to-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
        >
          احجز جلسة
        </Link>
      </div>
    </article>
  );
}
