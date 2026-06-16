"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Clock, DollarSign, Shield } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "كيف أجد أخصائي نفسي مناسب لاحتياجاتي؟",
    answer:
      "استخدم صفحة الأخصائيين لتصفية النتائج حسب التخصص (القلق، الاكتئاب، العلاقات، إلخ)، الخبرة، والسعر. يمكنك قراءة السيرة الذاتية وآراء المرضى السابقين قبل الحجز.",
    category: "الاختيار",
  },
  {
    question: "هل الجلسات آمنة وسرية تماماً؟",
    answer:
      "نعم، الجلسات تتم داخل المنصة بتشفير عسكري كامل ولا يتم مشاركة بياناتك مع أي طرف ثالث. يمكنك أيضاً اختيار نوع الجلسة (فيديو/صوت/شات) لحماية الخصوصية الإضافية.",
    category: "الأمان",
  },
  {
    question: "ما أنواع الجلسات المتاحة وكيف أختار؟",
    answer:
      "توفر المنصة ثلاث طرق: جلسات فيديو (تفاعل كامل)، صوتية (أكثر خصوصية)، ودردشة نصية (أكثر مرونة). اختر الطريقة التي تُناسبك وتُريحك نفسياً أكثر.",
    category: "الخدمات",
  },
  {
    question: "كيف يمكنني تغيير موعد الجلسة أو إلغاء الحجز؟",
    answer:
      "يمكنك التواصل مع الأخصائي مباشرة أو التواصل معنا عبر الدعم. في معظم الحالات يمكن تعديل الموعد بدون رسوم إضافية إذا كان هناك وقت كافي.",
    category: "الجدولة",
  },
  {
    question: "ما تكلفة الجلسة وهل هناك رسوم خفية؟",
    answer:
      "السعر يختلف حسب الأخصائي وخبرته ونوع الجلسة. تبدأ الأسعار من 50 ريال. جميع الأسعار شفافة بالكامل — بدون رسوم خفية. تراها قبل الحجز مباشرة.",
    category: "التسعير",
  },
  {
    question: "هل يمكنني الاستمرار مع الأخصائي نفسه والمتابعة؟",
    answer:
      "نعم بالتأكيد! يمكنك الاستمرار مع نفس الأخصائي إذا كان متاحاً، والأفضل حجز مواعيد متابعة منتظمة (أسبوعية أو شهرية) للحصول على نتائج أفضل وأسرع.",
    category: "المتابعة",
  },
];

const categories = [
  { name: "الاختيار", icon: "🎯", color: "from-blue-500 to-blue-600" },
  { name: "الأمان", icon: "🔒", color: "from-emerald-500 to-emerald-600" },
  { name: "الخدمات", icon: "📋", color: "from-purple-500 to-purple-600" },
  { name: "الجدولة", icon: "📅", color: "from-orange-500 to-orange-600" },
  { name: "التسعير", icon: "💰", color: "from-pink-500 to-pink-600" },
  { name: "المتابعة", icon: "📞", color: "from-teal-500 to-teal-600" },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

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
              <HelpCircle className="h-4 w-4" />
              الأسئلة الشائعة
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              أسئلتك <span className="text-yellow-200">مهمة لنا</span>
            </h1>
            <p className="text-xl text-white/90">
              الإجابات الواضحة على أكثر الأسئلة التي يطرحها عملاؤنا
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Category Filter */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-black text-slate-900">تصفح حسب الموضوع</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-6 py-3 font-semibold transition ${
                selectedCategory === null
                  ? "bg-teal-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-6 py-3 font-semibold transition ${
                  selectedCategory === cat.name
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-20">
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border-2 border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:border-teal-300 hover:shadow-md"
              >
                <button
                  onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 text-2xl">❓</div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition leading-relaxed">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-6 w-6 text-teal-600 flex-shrink-0 transition-transform duration-300 ${
                      expandedId === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedId === idx && (
                  <div className="border-t-2 border-slate-100 px-8 py-6 bg-gradient-to-br from-slate-50 to-white">
                    <p className="text-slate-700 leading-relaxed text-lg mb-4">{faq.answer}</p>
                    <div className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                      {faq.category}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-700 to-emerald-700 p-12 text-white mb-20">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <div className="mb-4 text-5xl">💬</div>
            <h2 className="mb-3 text-3xl font-black">لم تجد إجابتك؟</h2>
            <p className="mb-8 text-lg opacity-95">
              فريقنا جاهز للإجابة على جميع استفساراتك والمساعدة في أي سؤال لديك.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-teal-700 transition hover:shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                تواصل معنا
              </Link>
              <a
                href="tel:+201001234567"
                className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition"
              >
                أو اتصل بنا مباشرة ←
              </a>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">🚀 خطواتك القادمة</p>
            <h2 className="mb-4 text-3xl font-black text-slate-900">هل أنت جاهز للبدء؟</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "اختر أخصائيك",
                desc: "تصفح قائمة الأخصائيين والخدمات",
                href: "/therapists",
              },
              {
                icon: "📋",
                title: "احجز جلستك",
                desc: "اختر الموعد والنوع المناسب",
                href: "/therapists",
              },
              {
                icon: "🚀",
                title: "ابدأ العلاج",
                desc: "دخول غرفة الجلسة الآمنة",
                href: "/dashboard",
              },
            ].map((item, i) => (
              <Link
                key={`${item.href}-${item.title}-${i}`}
                href={item.href}
                className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-center hover:border-teal-300 hover:shadow-md transition group"
              >
                <div className="mb-4 text-5xl">{item.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
