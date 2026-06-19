import Link from "next/link";
import { Shield, Eye, Lock, Share2, Cookie, UserCheck, RefreshCw, Mail, ArrowLeft, Database } from "lucide-react";

const sections = [
  {
    icon: <Database className="w-6 h-6" />,
    number: "١",
    title: "البيانات التي نجمعها",
    body: "نجمع بيانات التسجيل الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف، بالإضافة إلى المعلومات المتعلقة بالحجز والجلسات لتحسين تجربتك.",
    color: "from-[#6366F1] to-[#8B5CF6]",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    number: "٢",
    title: "استخدام البيانات",
    body: "نستخدم بياناتك لتقديم الخدمات، التواصل معك، وإرسال التحديثات والعروض المرتبطة بخدماتنا. لن نشارك بياناتك مع أطراف ثالثة بدون إذن واضح منك.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    number: "٣",
    title: "الأمان والحماية",
    body: "نعتمد على إجراءات أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الضياع، وتشمل التشفير وجدران الحماية وبروتوكولات HTTPS.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: <Cookie className="w-6 h-6" />,
    number: "٤",
    title: "ملفات تعريف الارتباط",
    body: "قد نستخدم ملفات تعريف الارتباط لتحسين تجربتك داخل المنصة وتحليل أداء الموقع. يمكنك تعديل تفضيلات المتصفح للتحكم في هذه الملفات.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    number: "٥",
    title: "مشاركة المعلومات",
    body: "نشارك البيانات فقط مع مقدمي الخدمات الضروريين لتشغيل الموقع أو عند طلب قانوني. لا نبيع بياناتك لأي جهة تحت أي ظرف.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    number: "٦",
    title: "حقوقك",
    body: "يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها. نعمل على احترام طلباتك ضمن الأطر القانونية المعمول بها، وسنرد خلال ٣٠ يوماً.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    number: "٧",
    title: "تحديثات السياسة",
    body: "قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإعلامك بأي تغييرات مهمة عبر الموقع أو البريد الإلكتروني قبل تطبيقها.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    number: "٨",
    title: "كيفية الاتصال بنا",
    body: "لأي سؤال حول سياسة الخصوصية، يرجى التواصل معنا عبر support@doctornafsyonline.com أو الهاتف +201129639257. فريقنا جاهز للإجابة.",
    color: "from-slate-600 to-slate-800",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--color-background)] min-h-screen" dir="rtl">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B3A 40%, #064E3B 100%)" }}
      >
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-15 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#6366F1] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

        <div className="relative mx-auto max-w-4xl px-4 text-center text-white z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <Shield className="w-10 h-10 text-emerald-300" />
          </div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm">
            <Lock className="h-4 w-4 text-emerald-300" />
            آخر تحديث: يونيو ٢٠٢٦
          </span>
          <h1 className="mt-4 mb-6 text-5xl font-black md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white">
            سياسة الخصوصية
          </h1>
          <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            نحن في منصة دكتور نفسي أونلاين نلتزم بحماية بياناتك واحترام خصوصيتك التامة. خصوصيتك أمانة في عنقنا.
          </p>
        </div>
      </section>

      {/* Key Commitments */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "🔒", label: "لا نبيع بياناتك" },
              { icon: "🛡️", label: "تشفير من طرف إلى طرف" },
              { icon: "✋", label: "لا مشاركة بدون إذن" },
              { icon: "🗑️", label: "حق الحذف مضمون" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 p-4">
                <span className="text-4xl">{item.icon}</span>
                <span className="font-bold text-slate-700 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((sec) => (
              <div
                key={sec.number}
                className="group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute left-4 top-4 text-8xl font-black text-slate-50 select-none leading-none">
                  {sec.number}
                </div>
                <div className="relative z-10">
                  <div
                    className={`mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br ${sec.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {sec.icon}
                  </div>
                  <h2 className="mb-3 text-xl font-black text-slate-900">{sec.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{sec.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="mx-4 md:mx-8 mb-16 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064E3B, #065F46)" }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="mb-3 text-3xl font-black">هل لديك استفسار حول بياناتك؟</h2>
            <p className="text-emerald-100/80 text-lg leading-relaxed">
              فريق الدعم جاهز للإجابة على أي سؤال حول خصوصيتك وبياناتك.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a
                href="mailto:support@doctornafsyonline.com"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors font-semibold"
              >
                📧 support@doctornafsyonline.com
              </a>
              <a
                href="tel:+201129639257"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors font-semibold"
              >
                📞 +201129639257
              </a>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-emerald-800 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            تواصل معنا
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
