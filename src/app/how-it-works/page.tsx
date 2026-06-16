import { Calendar, Clock, MessageCircle, Phone, UserCheck, Video, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: UserCheck,
    title: "إنشاء الحساب",
    description:
      "سجل حسابك باستخدام بريدك الإلكتروني أو الحسابات الاجتماعية، ثم أكمل ملفك الشخصي بسهولة في دقائق.",
    number: "1",
  },
  {
    icon: Calendar,
    title: "استكشاف الأخصائيين",
    description:
      "تصفح قائمة الأخصائيين المتاحين حسب التخصص والخبرة والسعر والتقييمات، واختر من يناسبك.",
    number: "2",
  },
  {
    icon: Video,
    title: "اختيار نوع الجلسة",
    description:
      "اختر الطريقة التي تناسبك: فيديو (تفاعل كامل)، صوت (أكثر خصوصية)، أو شات نصي (أكثر مرونة).",
    number: "3",
  },
  {
    icon: Clock,
    title: "حجز الموعد",
    description:
      "حدد التاريخ والوقت المناسب من الفترات المتاحة عند الأخصائي واحصل على تأكيد فوري.",
    number: "4",
  },
  {
    icon: MessageCircle,
    title: "دخول الجلسة",
    description:
      "في موعد الجلسة، ادخل من لوحة تحكمك مباشرة إلى غرفة الجلسة الآمنة دون تطبيقات خارجية.",
    number: "5",
  },
  {
    icon: Phone,
    title: "المتابعة والدعم",
    description:
      "اتلقى ملاحظات من الأخصائي، وخطط المتابعة، وتواصل مستمر داخل المنصة لضمان نجاح العلاج.",
    number: "6",
  },
];

const features = [
  {
    title: "تجربة سلسة",
    description: "من التسجيل إلى الجلسة — كل شيء في واجهة واحدة سهلة",
    icon: "⚡",
  },
  {
    title: "أمان كامل",
    description: "تشفير عسكري وحماية كاملة لخصوصيتك وبياناتك الشخصية",
    icon: "🔒",
  },
  {
    title: "مرونة في الاختيار",
    description: "اختر أخصائيك، وقتك، نوع جلستك — أنت الذي تتحكم",
    icon: "🎯",
  },
  {
    title: "دعم مستمر",
    description: "تواصل دائم مع الأخصائي بين الجلسات ومتابعة منتظمة",
    icon: "💬",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 py-24 md:py-32">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              <Zap className="h-4 w-4" />
              كيف تعمل
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              ستة خطوات <span className="text-yellow-200">بسيطة</span> للبدء
            </h1>
            <p className="text-xl text-white/90">
              رحلة سهلة وآمنة من التسجيل إلى جلستك الأولى — دون أي تعقيدات
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Steps Grid */}
        <section className="mb-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">📋 الخطوات</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              رحلتك نحو الصحة النفسية
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              اتبع هذه الخطوات البسيطة والمباشرة للحصول على دعم نفسي متخصص
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-3xl border-2 border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2"
                >
                  {/* Top Bar */}
                  <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Number Circle */}
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-2xl font-black text-white">
                      {step.number}
                    </div>

                    {/* Icon & Title */}
                    <h3 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 text-slate-600 group-hover:text-slate-700 transition leading-relaxed">
                      {step.description}
                    </p>

                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-teal-50 transition">
                      <Icon className="h-5 w-5 text-slate-600 group-hover:text-teal-600 transition" />
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2">
                      <div className="w-10 h-0.5 bg-gradient-to-r from-teal-500 to-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="mb-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">✨ المميزات</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              ما يميز عملنا
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 text-center hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-bold text-slate-900 text-lg group-hover:text-teal-700 transition">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Visual */}
        <section className="mb-24 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-12 border-2 border-slate-200">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">⏱️ المدة الزمنية</p>
            <h2 className="mb-4 text-3xl font-black text-slate-900">
              من التسجيل إلى الجلسة
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "خطوات سريعة",
                time: "5 دقائق",
                desc: "التسجيل واختيار أخصائيك",
              },
              {
                title: "حجز الموعد",
                time: "2 دقيقة",
                desc: "اختر الوقت والنوع المناسب",
              },
              {
                title: "ابدأ العلاج",
                time: "فور الموعد",
                desc: "ادخل الجلسة من لوحتك مباشرة",
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-6 text-center border-2 border-slate-200 hover:border-teal-300 transition">
                <div className="mb-3 text-4xl font-black text-teal-600">{item.time}</div>
                <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-700 to-emerald-700 p-12 text-white">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <div className="mb-4 text-5xl">🚀</div>
            <h2 className="mb-3 text-3xl font-black">جاهز للبدء؟</h2>
            <p className="mb-8 text-lg opacity-95">
              لا تنتظر — ابدأ رحلتك نحو الصحة النفسية اليوم
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-teal-700 transition hover:shadow-lg hover:scale-105"
              >
                إنشاء حساب الآن ✓
              </Link>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition"
              >
                أو اعرض الأخصائيين ←
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
