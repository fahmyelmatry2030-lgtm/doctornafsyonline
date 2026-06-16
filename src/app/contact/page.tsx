"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

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
              <MessageCircle className="h-4 w-4" />
              تواصل معنا
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              نحن <span className="text-yellow-200">هنا لمساعدتك</span>
            </h1>
            <p className="text-xl text-white/90">
              أي سؤال أو استفسار؟ تواصل معنا — نرد على جميع الرسائل بسرعة
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <section>
            <div className="mb-12">
              <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">📍 معلومات التواصل</p>
              <h2 className="mb-4 text-4xl font-black text-slate-900">
                تواصل معنا بسهولة
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                اختر الطريقة التي تفضلها للتواصل معنا. فريقنا جاهز لمساعدتك في أي استفسار.
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="group rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">
                      البريد الإلكتروني
                    </h3>
                    <p className="text-slate-600">للاستفسارات العامة والدعم</p>
                    <a
                      href="mailto:support@docnafsyonline.com"
                      className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 transition"
                    >
                      support@docnafsyonline.com ←
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      الهاتف
                    </h3>
                    <p className="text-slate-600">للدعم السريع (24/7)</p>
                    <a
                      href="tel:+201001234567"
                      className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition"
                    >
                      +20 100 123 4567 ←
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="group rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-slate-900 group-hover:text-purple-700 transition">
                      الموقع
                    </h3>
                    <p className="text-slate-600">القاهرة، مصر</p>
                    <p className="mt-2 text-sm text-slate-500">
                      المقر الرئيسي — نقبل العملاء أونلاين فقط
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-6 w-6" />
                <h3 className="font-bold text-lg">متوسط وقت الرد</h3>
              </div>
              <p className="opacity-95">
                نرد على جميع الرسائل والاستفسارات خلال ساعة واحدة كحد أقصى
              </p>
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-10 shadow-sm">
              <div className="mb-8">
                <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">✉️ أرسل لنا رسالة</p>
                <h2 className="mb-3 text-3xl font-black text-slate-900">نموذج الاتصال</h2>
                <p className="text-slate-600">ملء الحقول أدناه وسنرد عليك قريباً</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm outline-none transition focus:border-teal-500 focus:bg-white placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm outline-none transition focus:border-teal-500 focus:bg-white placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    الرسالة
                  </label>
                  <textarea
                    rows={6}
                    placeholder="اكتب رسالتك هنا..."
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm outline-none transition focus:border-teal-500 focus:bg-white resize-none placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-slate-800 to-teal-600 px-6 py-4 text-sm font-bold text-white transition hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  أرسل الآن
                </button>

                {/* Success Message */}
                {submitted && (
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center gap-3 text-emerald-700">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                    <p className="font-semibold">
                      شكراً! تم إرسال رسالتك بنجاح. سنرد عليك قريباً.
                    </p>
                  </div>
                )}
              </form>

              {/* Privacy Note */}
              <p className="mt-6 text-xs text-slate-500 text-center">
                نحن نحترم خصوصيتك. لن نشارك بياناتك مع أي طرف ثالث.
              </p>
            </div>
          </section>
        </div>

        {/* FAQ Link */}
        <section className="mt-20 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 p-10 text-center">
          <h2 className="mb-4 text-2xl font-black text-slate-900">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="mb-6 text-slate-600">
            تصفح صفحة الأسئلة الشائعة — قد تجد الإجابة التي تبحث عنها هناك
          </p>
          <a
            href="/faq"
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3 font-bold text-white transition hover:bg-teal-700"
          >
            الأسئلة الشائعة ←
          </a>
        </section>
      </div>
    </div>
  );
}
