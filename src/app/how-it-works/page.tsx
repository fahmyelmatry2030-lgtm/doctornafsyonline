import { Calendar, Clock, MessageCircle, Phone, UserCheck, Video, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: UserCheck,
    title: "إنشاء الحساب",
    description:
      "سجل حسابك باستخدام بريدك الإلكتروني أو الحسابات الاجتماعية، ثم أكمل ملفك الشخصي بسهولة في دقائق معدودة لتخصيص تجربتك.",
    number: "1",
  },
  {
    icon: Calendar,
    title: "استكشاف الأخصائيين",
    description:
      "تصفح قائمة الأخصائيين المتاحين حسب التخصص، الخبرة، السعر، والتقييمات، واختر الأخصائي الأنسب لاحتياجاتك الخاصة.",
    number: "2",
  },
  {
    icon: Video,
    title: "اختيار نوع الجلسة",
    description:
      "اختر الطريقة التي تريحك: فيديو (لتواصل بصري كامل)، صوت (لخصوصية أكبر)، أو شات نصي (لمرونة عالية).",
    number: "3",
  },
  {
    icon: Clock,
    title: "حجز الموعد",
    description:
      "حدد التاريخ والوقت المناسب من الفترات المتاحة لدى الأخصائي واحصل على تأكيد فوري للحجز على بريدك الإلكتروني.",
    number: "4",
  },
  {
    icon: MessageCircle,
    title: "دخول الجلسة",
    description:
      "في الموعد المحدد، ادخل من لوحة تحكمك مباشرة إلى غرفة الجلسة الآمنة والمشفرة بالكامل دون الحاجة لتطبيقات خارجية.",
    number: "5",
  },
  {
    icon: Phone,
    title: "المتابعة والدعم",
    description:
      "تلقى ملاحظات من أخصائيك، تابع تطور حالتك، وتواصل معه باستمرار داخل المنصة لضمان نجاح رحلتك العلاجية.",
    number: "6",
  },
];

const features = [
  {
    title: "تجربة سلسة",
    description: "من التسجيل إلى الجلسة، واجهة واحدة مصممة بعناية فائقة لراحتك",
    icon: "⚡",
  },
  {
    title: "أمان كامل",
    description: "تشفير سري وحماية صارمة لبياناتك الشخصية وجلساتك العلاجية",
    icon: "🔒",
  },
  {
    title: "مرونة عالية",
    description: "أنت تتحكم في كل شيء: الأخصائي، الوقت، وحتى نوع التواصل",
    icon: "🎯",
  },
  {
    title: "دعم مستمر",
    description: "نحن معك في كل خطوة مع دعم فني مستمر ومتابعة متواصلة",
    icon: "💬",
  },
];

export default function HowItWorksPage() {
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
              <Zap className="h-4 w-4 text-[#6366F1]" />
              خطة التعافي
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-[var(--color-foreground)] md:text-6xl animate-fade-in-up stagger-2">
              <span className="gradient-text">6 خطوات</span> بسيطة لرحلة التعافي
            </h1>
            <p className="text-xl leading-relaxed text-slate-700 animate-fade-in-up stagger-3">
              صممنا رحلتك معنا لتكون سلسلة، بديهية، ومريحة تماماً. من لحظة التسجيل وحتى الجلسة الأولى، كل شيء واضح ومبسط.
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
        
        {/* Steps Timeline Grid */}
        <section className="mb-24 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6366F1]/0 via-[#6366F1]/20 to-[#6366F1]/0 -translate-x-1/2 hidden md:block z-0"></div>
          
          <div className="mb-16 text-center relative z-10">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2 animate-fade-in">
              <span className="text-xl">🗺️</span> خريطة الرحلة
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)] animate-fade-in-up">
              خطواتك نحو الراحة النفسية
            </h2>
          </div>

          <div className="space-y-12 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 !== 0;
              return (
                <div key={step.title} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full animate-fade-in-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
                  
                  {/* Left Column */}
                  <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start' : 'md:justify-end'} order-2 ${isEven ? 'md:order-3' : 'md:order-1'}`}>
                    <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 max-w-lg transition-premium hover:shadow-premium-hover hover:-translate-y-2">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-md">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-foreground)]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden md:flex flex-col items-center justify-center relative w-16 order-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E1B3A] to-[#312E81] border-4 border-white shadow-premium flex items-center justify-center z-10">
                      <span className="text-xl font-black text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Right Column (Empty spacer) */}
                  <div className={`w-full md:w-1/2 hidden md:block order-1 ${isEven ? 'md:order-1' : 'md:order-3'}`}></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline Visual (Simplified duration) */}
        <section className="mb-24 card-glow glass-strong rounded-3xl border border-[var(--color-border-soft)] p-12 shadow-premium animate-fade-in-up">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex justify-center gap-2 items-center">
              <span className="text-xl">⏱️</span> كفاءة الوقت
            </p>
            <h2 className="mb-4 text-3xl font-black text-[var(--color-foreground)]">
              أسرع مما تتخيل
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-border-soft)] to-transparent -translate-y-1/2 hidden md:block"></div>
            
            {[
              {
                title: "التسجيل والاختيار",
                time: "5 دقائق",
                desc: "إنشاء حساب واختيار الأخصائي المناسب",
              },
              {
                title: "حجز الموعد",
                time: "دقيقتان",
                desc: "تحديد الوقت المناسب وإتمام الحجز",
              },
              {
                title: "بدء العلاج",
                time: "فوراً",
                desc: "دخول الجلسة في موعدها المحدد",
              },
            ].map((item, idx) => (
              <div key={idx} className="glass rounded-2xl p-8 text-center border border-[var(--color-border-soft)] relative z-10 hover:shadow-md transition-premium hover:-translate-y-1">
                <div className="mb-4 text-4xl font-black text-[#6366F1] animate-pulse-soft">{item.time}</div>
                <h3 className="mb-2 text-xl font-bold text-[var(--color-foreground)]">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-24">
          <div className="mb-16 text-center animate-fade-in">
            <p className="mb-3 text-sm font-bold uppercase text-[#8B5CF6] tracking-widest flex items-center justify-center gap-2">
              <span className="text-xl">✨</span> القيمة
            </p>
            <h2 className="mb-4 text-4xl font-black text-[var(--color-foreground)]">
              لماذا تجربتنا مختلفة؟
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 text-center transition-premium hover:shadow-premium-hover hover:-translate-y-2 animate-fade-in-up group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-5 mx-auto flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm text-3xl transition-bounce group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-bold text-[var(--color-foreground)] text-lg group-hover:text-[#6366F1] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-[#1E1B3A] p-12 md:p-16 text-center text-white shadow-premium-lg">
          <div className="absolute inset-0 animate-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #1E1B3A, #312E81, #1E1B3A)' }}></div>
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#6366F1] blur-[100px] opacity-30 animate-float-slow pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-6 inline-block bg-white/10 p-5 rounded-full backdrop-blur-md border border-white/20 shadow-xl animate-pulse-glow">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="mb-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">جاهز للبدء الآن؟</h2>
            <p className="mb-10 max-w-2xl mx-auto text-xl opacity-95 text-[#A5B4FC] leading-relaxed">
              لا تؤجل صحتك النفسية. ابدأ رحلتك اليوم بخطوات بسيطة وانضم للآلاف ممن اختاروا منصتنا للتعافي.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-[#312E81] transition-bounce hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                إنشاء حساب مجاني
                <span className="bg-[#EEF2FF] text-[#6366F1] rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></span>
              </Link>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-2 text-[#C7D2FE] font-semibold hover:text-white transition-colors py-4 px-6"
              >
                تصفح قائمة الأخصائيين
                <span>←</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
