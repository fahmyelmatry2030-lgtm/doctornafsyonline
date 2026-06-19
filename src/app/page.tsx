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
  let therapists: any[] = [];
  let dbError = null;
  try {
    therapists = await getFeaturedTherapists();
  } catch (err: any) {
    dbError = err.message || String(err);
  }

  if (dbError) {
    return (
      <div style={{ padding: '50px', color: 'red', direction: 'ltr' }}>
        <h1>Fatal Database Error</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '20px' }}>{dbError}</pre>
      </div>
    );
  }

  return (
    <>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-[var(--color-surface-warm)] py-28 md:py-40">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-10 left-1/3 h-96 w-96 rounded-full bg-[var(--color-surface-cool)] blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-[var(--color-border-soft)] blur-3xl animate-float"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#312E81] animate-fade-in-up stagger-1 shadow-premium">
              <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
              رعاية نفسية مبسطة بثقة وخصوصية
            </span>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl lg:text-7xl animate-fade-in-up stagger-2">
              الدعم النفسي الذي تحتاجه الآن مع أخصائيين <span className="gradient-text">موثوقين</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              جلسات علاج نفسي عبر الفيديو والصوت والشات، ضمن منصة آمنة وسهلة الاستخدام.
              <br className="hidden md:block" />
              السرية والراحة هما الأساس، ونحن معك في كل خطوة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-fade-in-up stagger-4">
              <Link
                href="/therapists"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-8 py-4 text-lg font-bold text-white overflow-hidden transition-premium hover:shadow-premium-hover hover:scale-105"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="relative z-10">احجز جلسة الآن ✓</span>
              </Link>
              <Link
                href="/about"
                className="glass-strong rounded-full px-8 py-4 text-lg font-bold text-[var(--color-foreground)] transition-premium hover:shadow-premium-hover hover:scale-105"
              >
                اكتشف كيف نعمل →
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 animate-fade-in-up stagger-5">
            {[
              { value: "100+", label: "جلسة ناجحة", icon: "✓" },
              { value: "4.9⭐", label: "تقييم العملاء", icon: "⭐" },
              { value: "50+", label: "أخصائي معتمد", icon: "👨‍⚕️" },
              { value: "24/7", label: "خدمة متاحة", icon: "🕐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass card-glow rounded-2xl p-6 text-center shadow-premium transition-premium hover:-translate-y-1 hover:shadow-premium-hover"
              >
                <div className="text-3xl font-black text-[var(--color-foreground)]">{stat.value}</div>
                <div className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-12 animate-fade-in-up stagger-6">
            <div className="glass-strong mx-auto max-w-3xl rounded-2xl p-8 shadow-premium relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-8xl text-[#6366F1] opacity-10">"</div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="text-4xl text-[#8B5CF6]">“</div>
                <div>
                  <p className="mb-4 text-lg text-[var(--color-foreground)] font-medium leading-relaxed">
                    وجدت دعماً حقيقياً ومهنية من الأخصائي. الحجز كان سهلاً والجلسة كانت خصوصية وأمان. تجربة غيرت حياتي للأفضل.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="font-bold text-[var(--color-foreground)]">— ليلى، متلقية خدمة</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1 text-[#F59E0B]">
                      <Star className="w-4 h-4 fill-current" /> 4.9
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-24 bg-[var(--color-background)] relative">
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              لماذا <span className="gradient-text">دكتور نفسى اونلاين؟</span>
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
                desc: "تشفير سري للجلسات وحماية بياناتك وفق أعلى المعايير الدولية",
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
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className={`card-glow rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border-soft)] p-8 shadow-premium transition-premium hover:-translate-y-2 hover:shadow-premium-hover animate-fade-in-up`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-lg animate-pulse-glow">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-foreground)]">{title}</h3>
                <p className="leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative py-24 bg-[var(--color-surface-cool)] overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none hero-grid"></div>
        
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">خطة التعافي</h2>
            <p className="text-lg text-slate-600">أربع خطوات فقط لبدء رحلتك مع الدعم النفسي</p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-20"></div>

            {[
              { step: "1", title: "سجّل حسابك", desc: "أنشئ حساباً آمناً في دقائق بسهولة" },
              { step: "2", title: "اختر أخصائيك", desc: "تصفح التخصصات والتقييمات والخبرات" },
              { step: "3", title: "احجز موعدك", desc: "فيديو أو صوت أو شات — اختر ما يناسبك" },
              { step: "4", title: "ابدأ الجلسة", desc: "ادخل غرفة الجلسة الآمنة من لوحتك" },
            ].map(({ step, title, desc }, idx) => (
              <div key={step} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="text-center group">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-premium text-2xl font-black text-[#6366F1] border-4 border-[var(--color-surface-cool)] transition-bounce group-hover:scale-110 group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#8B5CF6] relative z-10">
                    {step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[var(--color-foreground)]">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed px-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DISCOVERY SECTION ============ */}
      <section className="py-24 bg-[var(--color-background)] relative">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">اكتشف المزيد</h2>
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
            ].map((item, idx) => (
              <Link
                key={item.title}
                href={item.href}
                className="group card-glow rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border-soft)] p-8 shadow-premium transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up block"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative">
                  <div className="mb-5 text-5xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-bounce">{item.icon}</div>
                  <h3 className="mb-3 text-2xl font-bold text-[var(--color-foreground)] group-hover:text-[#6366F1] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mb-6 text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-2 text-[#8B5CF6] font-bold group-hover:gap-4 transition-all">
                    زيارة الصفحة <span className="text-xl">←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED THERAPISTS ============ */}
      {therapists.length > 0 && (
        <section className="py-24 bg-[var(--color-surface-warm)] relative overflow-hidden">
          {/* Background blob */}
          <div className="absolute -left-40 top-20 w-96 h-96 bg-[#FDE68A] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow pointer-events-none"></div>

          <div className="mx-auto max-w-6xl px-4 relative z-10">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
              <div>
                <h2 className="text-4xl font-black text-[var(--color-foreground)]">
                  أخصائيين <span className="gradient-text-warm">مميزين</span>
                </h2>
                <p className="mt-3 text-lg text-slate-600 font-medium">جاهزون لدعم رحلتك ومساعدتك لتخطي التحديات</p>
              </div>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-border-soft)] shadow-premium px-8 py-3.5 font-bold text-[var(--color-foreground)] transition-premium hover:shadow-premium-hover hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                عرض كل الأخصائيين ← 
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {therapists.map((t, idx) =>
                t.therapistProfile ? (
                  <div key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
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
                      imageUrl={t.therapistProfile.avatarUrl || undefined}
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ THERAPIST CTA ============ */}
      <section className="relative overflow-hidden py-24 m-4 md:m-8 rounded-3xl bg-[#1E1B3A] shadow-premium-lg">
        {/* Animated Background */}
        <div className="absolute inset-0 animate-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #1E1B3A, #312E81, #1E1B3A)' }}></div>
        <div className="absolute inset-0 opacity-20 hero-grid pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#6366F1] rounded-full blur-3xl opacity-40 animate-float-slow pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#8B5CF6] rounded-full blur-3xl opacity-40 animate-float pointer-events-none"></div>

        <div className="relative mx-auto max-w-4xl px-4 text-center text-white z-10">
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-pulse-glow">
            <span className="text-5xl">👨‍⚕️</span>
          </div>
          <h2 className="mb-6 text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">
            هل أنت أخصائي نفسي؟
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-[#A5B4FC] leading-relaxed">
            انضم لمنصة دكتور نفسى اونلاين وقدّم خدماتك لآلاف الباحثين عن الدعم النفسي والعلاج المتخصص في بيئة احترافية متكاملة.
          </p>
          <Link
            href="/register?role=therapist"
            className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#312E81] transition-bounce hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            ابدأ معنا الآن
            <span className="bg-[#EEF2FF] text-[#6366F1] rounded-full p-1"><CheckCircle2 className="w-5 h-5" /></span>
          </Link>
        </div>
      </section>
    </>
  );
}
