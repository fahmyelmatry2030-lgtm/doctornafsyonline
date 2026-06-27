"use client";

import Link from "next/link";
import { TherapistCard } from "@/components/TherapistCard";
import { Calendar, MessageCircle, Clock, ArrowLeft, Star, HeartPulse } from "lucide-react";
import { useSession } from "next-auth/react";

export function AppHome({ therapists, locale }: { therapists: any[], locale: string }) {
  const { data: session } = useSession();
  const isArabic = locale !== "en";
  const prefix = isArabic ? "" : "/en";

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* App Header (Curved) */}
      <div className="bg-[#4318FF] rounded-b-[40px] pt-12 pb-16 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <HeartPulse className="w-64 h-64 -mr-20 -mt-20" />
        </div>
        <div className="relative z-10">
          <h1 className="text-white text-2xl font-bold mb-2">
            {isArabic ? "مرحباً بك في دكتور نفسي" : "Welcome to Nafsi"}
          </h1>
          <p className="text-white/80 text-sm">
            {isArabic ? "الدعم النفسي الذي تحتاجه في أي وقت." : "The mental support you need, anytime."}
          </p>
          
          {/* Quick Actions Card */}
          <div className="mt-8 bg-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 absolute -bottom-24 left-6 right-6">
            <Link href={`${prefix}/therapists`} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">{isArabic ? "حجز جلسة" : "Book Session"}</span>
            </Link>
            
            <Link href={session ? `${prefix}/dashboard` : `${prefix}/login`} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors border-x border-slate-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">{isArabic ? "استشاراتي" : "My Sessions"}</span>
            </Link>
            
            <Link href={`${prefix}/how-it-works`} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">{isArabic ? "كيف نعمل" : "How it Works"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-32 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{isArabic ? "أخصائيون متاحون الآن" : "Available Therapists"}</h2>
          <Link href={`${prefix}/therapists`} className="text-sm font-bold text-[#4318FF] flex items-center gap-1">
            {isArabic ? "عرض الكل" : "View All"} <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* Horizontal scroll for therapists */}
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
          {therapists.map((therapist) => (
            <div key={therapist.id} className="min-w-[280px] snap-center shrink-0">
              <TherapistCard
                id={therapist.id}
                name={therapist.name}
                bio={therapist.therapistProfile.bio}
                specializations={therapist.therapistProfile.specializations}
                pricePerSession={therapist.therapistProfile.pricePerSession}
                yearsExperience={therapist.therapistProfile.yearsExperience}
                rating={therapist.therapistProfile.rating}
                reviewCount={therapist.therapistProfile.reviewCount}
                isVerified={therapist.therapistProfile.isVerified}
                isOnline={therapist.isOnline}
                imageUrl={therapist.avatar}
                currency={therapist.currency}
              />
            </div>
          ))}
        </div>
        
        {/* Why Us Box */}
        <div className="mt-4 bg-gradient-to-br from-indigo-900 to-[#1E1B3A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-20">
            <Clock className="w-32 h-32 -mr-10 -mb-10" />
          </div>
          <h3 className="text-lg font-bold mb-2 relative z-10">{isArabic ? "رعاية نفسية متكاملة" : "Complete Mental Care"}</h3>
          <p className="text-sm text-indigo-200 relative z-10 leading-relaxed max-w-[80%]">
            {isArabic ? "تواصل مع فريق من الخبراء والمعالجين النفسيين بكل سرية وبضغطة زر واحدة." : "Connect with experts and therapists confidentially with a single click."}
          </p>
        </div>
      </div>
    </div>
  );
}
