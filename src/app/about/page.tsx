import { HeartHandshake, Shield, Users, CheckCircle2, Target, Lightbulb } from "lucide-react";
import Link from "next/link";

const values = [
  {
    title: "مهمة واضحة",
    description:
      "نوفر لك تجربة علاج نفسى آمنة وسهلة من أول حجز حتى انتهاء المتابعة والدعم المستمر.",
    icon: HeartHandshake,
  },
  {
    title: "أخصائيين موثوقين",
    description:
      "نختار أخصائيين نفسيين حاصلين على شهادات معتمدة ولديهم سجل نجاح موثوق وتقييمات عالية.",
    icon: Users,
  },
  {
    title: "خصوصية تامة",
    description:
      "نضمن سرية تامة لبياناتك وجلساتك مع تشفير عسكري والتحكم الكامل في معلوماتك الشخصية.",
    icon: Shield,
  },
];

const whyChooseUs = [
  { title: "أخصائيين معتمدين", desc: "فريق مختار بعناية من المتخصصين المعتمدين" },
  { title: "منصة مدمجة", desc: "فيديو وصوت وشات بدون تطبيقات خارجية" },
  { title: "حجز مرن", desc: "اختر الموعد والأخصائي المناسب لك بسهولة" },
  { title: "أسعار منصفة", desc: "تسعير شفاف وعادل للجميع" },
];

export default function AboutPage() {
  return (
    <div>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-teal-800 to-teal-700 py-24 md:py-32">
        <div className="absolute inset-0 opacity-6">
          <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              <Target className="h-4 w-4" />
              من نحن
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              دكتور نفسى <span className="text-teal-200">اونلاين</span>
            </h1>
            <p className="text-xl text-white/90">
              منصة عربية متخصصة في العلاج النفسي عن بعد بأعلى معايير الجودة والسرية
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* About Section */}
        <section className="mb-20 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-12 border border-slate-200 shadow-sm">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 text-sm font-bold uppercase text-teal-600 tracking-widest">
                💡 من نحن
              </p>
              <h2 className="mb-6 text-4xl font-black text-slate-900">
                خدمة صحية نفسية احترافية 100%
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                نربطك بأخصائيين نفسيين معتمدين لتلقي الدعم العلاجي في جلسات فيديو وصوت ومحادثة نصية
                داخل <span className="font-bold text-teal-700">نفس الموقع</span>. بدون Zoom. بدون WhatsApp.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                نسعى لتقديم خدمة مبسطة ومريحة لجميع الباحثين عن رعاية نفسية موثوقة، مع التركيز على السرية الكاملة،
                الجودة العالية، والراحة النفسية في كل خطوة من الرحلة.
              </p>
              <div className="flex flex-col gap-3">
                {["أخصائيين معتمدين حصراً", "جلسات آمنة وسرية", "دعم مستمر وموثوق"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-96 w-full rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-grid-pattern"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-8xl">🏥</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">✨ قيمنا الأساسية</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              تبني ثقتك أولاً وأخيراً
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              ثلاث قيم أساسية تحكم كل قرار نتخذه في منصتنا
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border-2 border-slate-200 bg-white p-10 transition-all duration-300 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white group-hover:from-teal-600 group-hover:to-emerald-600 transition-all">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-slate-600 group-hover:text-slate-700 transition">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-20 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-600 p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <Lightbulb className="mb-4 h-12 w-12" />
            <h2 className="mb-4 text-4xl font-black">رؤيتنا للمستقبل</h2>
            <p className="mb-8 text-xl leading-relaxed opacity-95">
              أن تكون خدمة العلاج النفسي الأونلاين الخيار الأول للأشخاص الباحثين عن دعم نفسي عربي موثوق وشامل،
              يجمع بين المهنية والخصوصية والتجربة السهلة والمريحة.
            </p>
            <Link
              href="/therapists"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-teal-700 transition hover:shadow-xl hover:scale-105"
            >
              ابدأ الآن ✓
            </Link>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">🎯 المميزات</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">لماذا تختارنا؟</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              الأسباب التي تجعل آلاف الأشخاص يثقون بنا
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <div className="mb-4 text-4xl">✓</div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
