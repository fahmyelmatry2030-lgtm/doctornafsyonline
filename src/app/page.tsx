import Link from "next/link";
import {
  Shield,
  Video,
  MessageCircle,
  Clock,
  Star,
  Users,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TherapistCard } from "@/components/TherapistCard";

async function getFeaturedTherapists() {
  return prisma.user.findMany({
    where: { role: "THERAPIST", therapistProfile: { isAvailable: true } },
    include: { therapistProfile: true },
    take: 3,
    orderBy: { therapistProfile: { rating: "desc" } },
  });
}

export default async function HomePage() {
  const therapists = await getFeaturedTherapists();

  return (
    <>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-slate-100 to-emerald-100 py-28 md:py-40">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-10 left-1/3 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-slate-200/80 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
              <Sparkles className="h-4 w-4" />
              رعاية نفسية مبسطة بثقة وخصوصية
            </span>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-black leading-tight text-slate-900 md:text-6xl lg:text-7xl">
              الدعم النفسي الذي تحتاجه الآن مع أخصائيين <span className="text-teal-700">موثوقين</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl leading-relaxed text-slate-700">
              جلسات علاج نفسي عبر الفيديو والصوت والشات، ضمن منصة آمنة وسهلة الاستخدام.
              <br className="hidden md:block" />
              السرية والراحة هما الأساس، ونحن معك في كل خطوة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/therapists"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-slate-800 to-teal-600 px-8 py-4 text-lg font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <span className="relative z-10">احجز جلسة الآن ✓</span>
              </Link>
              <Link
                href="/about"
                className="rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-lg font-bold text-slate-900 transition hover:border-teal-400 hover:bg-emerald-50"
              >
                اكتشف كيف نعمل →
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-24 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { value: "100+", label: "جلسة ناجحة", icon: "✓" },
              { value: "4.9⭐", label: "تقييم العملاء", icon: "⭐" },
              { value: "50+", label: "أخصائي معتمد", icon: "👨‍⚕️" },
              { value: "24/7", label: "خدمة متاحة", icon: "🕐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl bg-white border border-slate-200 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Testimonial */}
          <div className="mt-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-4xl">“</div>
                <div>
                  <p className="mb-2 text-lg text-slate-800 font-medium">
                    وجدت دعماً حقيقياً ومهنية من الأخصائي. الحجز كان سهلاً والجلسة كانت خصوصية وأمان.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">— ليلى، متلقية خدمة</span>
                    <span>·</span>
                    <span>4.9⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              لماذا دكتور نفسى اونلاين؟
            </h2>
            <p className="text-lg text-slate-600">
              كل ما تحتاجه في مكان واحد — بدون تطبيقات خارجية
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Video,
                title: "فيديو وصوت مدمج",
                desc: "جلسات فيديو وصوت عالية الجودة داخل المنصة مباشرة، بدون قيود",
              },
              {
                icon: MessageCircle,
                title: "شات أثناء الجلسة",
                desc: "محادثة نصية متزامنة لإرسال الروابط والملاحظات والموارد",
              },
              {
                icon: Shield,
                title: "خصوصية وأمان عالي",
                desc: "تشفير عسكري للجلسات وحماية بياناتك وفق أعلى المعايير الدولية",
              },
              {
                icon: Clock,
                title: "حجز مرن وسهل",
                desc: "اختر الموعد والأخصائي ونوع الجلسة المناسب لك بكل سهولة",
              },
              {
                icon: Lock,
                title: "سرية تامة مضمونة",
                desc: "لا يمكن لأحد الوصول لجلساتك — محمية بالكامل تحت الحماية القانونية",
              },
              {
                icon: HeartHandshake,
                title: "أخصائيين معتمدين فقط",
                desc: "فريق من المتخصصين المعتمدين في مختلف مجالات العلاج النفسي",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-teal-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white group-hover:from-teal-600 group-hover:to-emerald-600 transition-all">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-800">{title}</h3>
                <p className="leading-relaxed text-slate-600 group-hover:text-slate-700">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-4xl font-black text-slate-900">كيف تعمل المنصة؟</h2>
          <p className="mb-16 text-center text-lg text-slate-600">أربع خطوات فقط لبدء رحلتك مع الدعم النفسي</p>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "سجّل حسابك", desc: "أنشئ حساباً آمناً في دقائق بسهولة" },
              { step: "2", title: "اختر أخصائيك", desc: "تصفح التخصصات والتقييمات والخبرات" },
              { step: "3", title: "احجز موعدك", desc: "فيديو أو صوت أو شات — اختر ما يناسبك" },
              { step: "4", title: "ابدأ الجلسة", desc: "ادخل غرفة الجلسة الآمنة من لوحتك" },
            ].map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                {/* Arrow connector */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 h-0.5 w-8 bg-gradient-to-r from-teal-500 to-transparent"></div>
                )}

                <div className="text-center group">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-2xl font-black text-white transition-all group-hover:shadow-lg group-hover:scale-110">
                    {step}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-800">{title}</h3>
                  <p className="text-sm text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DISCOVERY SECTION ============ */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-slate-900">اكتشف المزيد</h2>
            <p className="text-lg text-slate-600">
              تصفح صفحاتنا المفيدة لتفهم خدماتنا بشكل أعمق
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "من نحن",
                description: "تعرف على مهمتنا وقيمنا وكيف نعمل لتحسين الصحة النفسية العربية.",
                href: "/about",
                icon: "🎯",
              },
              {
                title: "الخدمات",
                description: "اكتشف أنواع الجلسات التي نقدمها والأسعار وكيف تختار المناسب.",
                href: "/services",
                icon: "🔧",
              },
              {
                title: "أسئلة شائعة",
                description: "إجابات عن أكثر الأسئلة التي يطرحها عملاؤنا.",
                href: "/faq",
                icon: "❓",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all duration-300 hover:border-teal-400 hover:shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="mb-3 text-4xl">{item.icon}</div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                    زيارة الصفحة ←
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED THERAPISTS ============ */}
      {therapists.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900">
                  أخصائيين مميزين
                </h2>
                <p className="mt-2 text-lg text-slate-600">جاهزون لدعم رحلتك</p>
              </div>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-bold text-white transition hover:bg-teal-700 hover:gap-3"
              >
                عرض الكل ← 
              </Link>
            </div>
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
          </div>
        </section>
      )}

      {/* ============ THERAPIST CTA ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center text-white">
          <div className="mb-6 text-5xl">👨‍⚕️</div>
          <h2 className="mb-4 text-4xl font-black">هل أنت أخصائي نفسي؟</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg opacity-95">
            انضم لمنصة دكتور نفسى اونلاين وقدّم خدماتك لآلاف الباحثين عن الدعم النفسي والعلاج المتخصص
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-teal-700 transition hover:shadow-xl hover:scale-105"
          >
            ابدأ معنا الآن ✓
          </Link>
        </div>
      </section>
    </>
  );
}
