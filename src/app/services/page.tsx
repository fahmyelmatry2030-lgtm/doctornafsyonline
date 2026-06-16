import { HeartHandshake, Shield, Video, Phone, MessageCircle, Clock, CheckCircle2, Zap, Award } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Video,
    title: "جلسات فيديو شخصية",
    description:
      "دردشة مواجهة بالأخصائي النفسي بالصوت والصورة لتجربة علاجية تفاعلية وأكثر قرباً وتأثراً.",
    benefits: ["تفاعل مباشر كامل", "تقييم لغة الجسد", "اتصال شخصي قوي"],
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Phone,
    title: "جلسات صوتية مرنة",
    description:
      "جهازك هو كل ما تحتاجه؛ تحدث مع الأخصائي دون تصوير مع نفس الخصوصية والدعم المهني.",
    benefits: ["مرونة تامة", "خصوصية أكثر", "أقل استهلاكاً للإنترنت"],
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: MessageCircle,
    title: "جلسات شات نصي",
    description:
      "حل سريع ومريح للتواصل النفسي المباشر عبر الرسائل داخل المنصة دون مكالمات صوتية.",
    benefits: ["متابعة مستمرة", "توثيق كامل", "دعم من أي مكان"],
    color: "from-purple-500 to-purple-600",
  },
];

const reasons = [
  {
    icon: Shield,
    title: "أمان وخصوصية عالية",
    description:
      "تشفير عسكري كامل لجلساتك، مع الالتزام الكامل بحماية بياناتك وعدم مشاركتها بأي شكل.",
  },
  {
    icon: HeartHandshake,
    title: "عناية مهنية معتمدة",
    description:
      "أخصائيون مختصون ومعتمدون في القلق والاكتئاب والعلاقات والتنمية الذاتية والمراهقة.",
  },
  {
    icon: Clock,
    title: "حجز في دقائق فقط",
    description:
      "حدد الموعد والنوع والأخصائي المناسبين لك بسرعة، وابدأ جلستك دون تعقيدات.",
  },
];

const features = [
  { title: "منصة مدمجة", description: "فيديو وصوت وشات - كل شيء في مكان واحد" },
  { title: "أخصائيين معتمدين", description: "فريق مختار بعناية من المتخصصين الموثوقين" },
  { title: "أسعار منصفة", description: "تسعير شفاف وعادل لجميع الخدمات" },
  { title: "متابعة مستمرة", description: "دعم مستمر بعد كل جلسة وملاحظات شخصية" },
];

export default function ServicesPage() {
  return (
    <div>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-teal-800 to-teal-700 py-24 md:py-32">
        <div className="absolute inset-0 opacity-6">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              <Zap className="h-4 w-4" />
              الخدمات
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              خدمات العلاج النفسي <span className="text-yellow-200">الكاملة</span>
            </h1>
            <p className="text-xl text-white/90">
              اختر الطريقة التي تناسبك للتواصل مع أخصائي معتمد — كل أنواع الجلسات في مكان واحد آمن
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Services Cards */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">🎯 أنواع الخدمات</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              اختر نوع الجلسة المناسب لك
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              ثلاث طرق مختلفة للتواصل مع أخصائيك، كل منها مصممة لاحتياجات مختلفة
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group relative rounded-3xl border-2 border-slate-200 bg-white overflow-hidden shadow-md transition-all duration-300 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2"
                >
                  {/* Top Color Bar */}
                  <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>

                  <div className="p-8">
                    {/* Icon */}
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white`}>
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="mb-3 text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {service.title}
                    </h3>
                    <p className="mb-6 text-slate-600 group-hover:text-slate-700 transition">
                      {service.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-2 mb-6 pt-6 border-t border-slate-100">
                      {service.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href="/therapists"
                      className="inline-block w-full text-center rounded-xl bg-gradient-to-r from-slate-800 to-teal-600 px-4 py-3 font-semibold text-white transition hover:shadow-lg group-hover:scale-105"
                    >
                      احجز جلسة الآن
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why We're Different */}
        <section className="mb-20 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-12 border-2 border-slate-200">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">✨ المميزات الفريدة</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              لماذا خدماتنا مختلفة؟
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              نركز على ما يهمك: جودة، أمان، وسهولة الاستخدام
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="group rounded-2xl bg-white p-8 border-2 border-slate-200 hover:border-teal-300 transition-all hover:shadow-md"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white group-hover:from-teal-600 group-hover:to-emerald-600 transition-all">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {reason.title}
                  </h3>
                  <p className="text-slate-600 group-hover:text-slate-700 transition">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">🌟 ما تحصل عليه</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">
              كل ما تحتاجه في مكان واحد
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 text-center hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="mb-4 text-4xl">✓</div>
                <h3 className="mb-2 font-bold text-slate-900 text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Info */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-700 to-emerald-700 p-12 text-white">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <Award className="mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-black">أسعار منصفة وشفافة</h2>
            <p className="mb-8 text-lg opacity-95">
              تختلف الأسعار حسب أخصائيك وخبرته. تصفح قائمة الأخصائيين لرؤية الأسعار المحددة.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                <div className="text-2xl font-black">بدء من</div>
                <div className="text-3xl font-black">50 ريال</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                <div className="text-2xl font-black">بدون</div>
                <div className="text-3xl font-black">رسوم خفية</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                <div className="text-2xl font-black">شفافة</div>
                <div className="text-3xl font-black">100%</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
