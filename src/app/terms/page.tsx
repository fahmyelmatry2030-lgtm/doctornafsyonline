import Link from "next/link";
import { Shield, FileText, CreditCard, User, Database, Bell, Scale, Gavel, ArrowLeft, CheckCircle2 } from "lucide-react";

const sections = [
  {
    icon: <User className="w-6 h-6" />,
    number: "١",
    title: "القبول والتسجيل",
    body: "بالتسجيل في المنصة، فإنك تقر بأنك تستخدم بيانات صحيحة وحقيقية، وأنك مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بك.",
    color: "from-[#6366F1] to-[#8B5CF6]",
    bg: "bg-[#EEF2FF]",
    text: "text-[#6366F1]",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    number: "٢",
    title: "حقوق المنصة",
    body: "تمتلك منصة دكتور نفسي أونلاين كافة حقوق المحتوى والخدمات المقدمة. لا يجوز نسخ أو إعادة نشر أي محتوى بدون إذن خطي مسبق.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    number: "٣",
    title: "استخدام الخدمة",
    body: "يُمنع استخدام المنصة لأغراض غير قانونية أو مزعجة. يجب احترام سياسة السلوك المهني عند التواصل مع الأخصائيين.",
    color: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    text: "text-teal-600",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    number: "٤",
    title: "الدفع والاسترداد",
    body: "تتم عمليات الدفع عبر قنوات الدفع المصرح بها داخل المنصة (فودافون كاش، موبينيل كاش، اتصالات كاش، انستاباي، التحويل البنكي). لا يمكن المطالبة باسترداد الأموال بعد بدء الجلسة إلا وفق سياسة الاسترداد الخاصة بالمنصة.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    icon: <User className="w-6 h-6" />,
    number: "٥",
    title: "مسؤولية المستخدم",
    body: "أنت مسؤول عن المعلومات التي تقدمها أثناء التسجيل أو أثناء الجلسات. احترس من مشاركة أي بيانات حساسة خارج إطار المنصة.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    icon: <Database className="w-6 h-6" />,
    number: "٦",
    title: "البيانات والمحتوى",
    body: "المحتوى الطبي والنفسي المقدم في المنصة هو معلومات عامة ولا يغني عن التشخيص الطبي أو النفسي الشخصي.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    number: "٧",
    title: "التعديلات والإشعارات",
    body: "نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم الإعلان عن التعديلات عبر الموقع أو البريد الإلكتروني.",
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    icon: <Gavel className="w-6 h-6" />,
    number: "٨",
    title: "القانون المعمول به",
    body: "تخضع هذه الشروط للقوانين السارية في جمهورية مصر العربية، وأي نزاع يتم حله أمام الجهات القضائية المختصة.",
    color: "from-slate-600 to-slate-800",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[var(--color-background)] min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E1B3A] via-[#312E81] to-[#1E1B3A] py-24 md:py-32">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366F1 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8B5CF6 0%, transparent 50%)' }}></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#6366F1] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#8B5CF6] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="relative mx-auto max-w-4xl px-4 text-center text-white z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <Scale className="w-10 h-10 text-[#C7D2FE]" />
          </div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm">
            <FileText className="h-4 w-4" />
            آخر تحديث: يونيو ٢٠٢٦
          </span>
          <h1 className="mt-4 mb-6 text-5xl font-black md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C7D2FE]">
            الشروط والأحكام
          </h1>
          <p className="text-xl text-[#A5B4FC] max-w-2xl mx-auto leading-relaxed">
            باستخدامك لمنصة دكتور نفسي أونلاين، فأنت توافق على الشروط التالية التي تضمن تجربة آمنة وموثوقة لكافة المستخدمين.
          </p>
        </div>
      </section>

      {/* Summary Points */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "🔐", label: "خصوصية مضمونة" },
              { icon: "✅", label: "استخدام مسؤول" },
              { icon: "💳", label: "دفع آمن" },
              { icon: "⚖️", label: "حقوق محفوظة" },
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
                {/* Background number */}
                <div className="absolute left-4 top-4 text-8xl font-black text-slate-50 select-none leading-none">{sec.number}</div>

                <div className="relative z-10">
                  <div className={`mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br ${sec.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
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
      <section className="mx-4 md:mx-8 mb-16 rounded-3xl bg-gradient-to-r from-[#1E1B3A] to-[#312E81] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6366F1] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8B5CF6] rounded-full blur-3xl opacity-30"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="mb-3 text-3xl font-black">هل لديك استفسار؟</h2>
            <p className="text-[#A5B4FC] text-lg leading-relaxed">
              فريق الدعم جاهز لمساعدتك في أي استفسار حول الشروط والأحكام.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a href="mailto:support@doctornafsyonline.com" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors font-semibold">
                📧 support@doctornafsyonline.com
              </a>
              <a href="tel:+201129639257" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors font-semibold">
                📞 +201129639257
              </a>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-[#312E81] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            تواصل معنا
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
