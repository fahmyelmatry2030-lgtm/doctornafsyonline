import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <section className="mb-16 rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
        <span className="mb-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          الشروط والأحكام
        </span>
        <h1 className="mb-6 text-5xl font-black text-slate-900">شروط وأحكام استخدام منصة دكتور نفسي أونلاين</h1>
        <p className="text-lg leading-relaxed text-slate-600">
          ترحب بك منصة دكتور نفسي أونلاين. باستخدام هذا الموقع وخدماتنا، أنت توافق على الشروط التالية التي تضمن تجربة آمنة وموثوقة لكافة المستخدمين.
        </p>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">1. القبول والتسجيل</h2>
            <p className="text-slate-600 leading-relaxed">
              بالتسجيل في المنصة، فإنك تقر بأنك تستخدم بيانات صحيحة وحقيقية، وأنك مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بك.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">2. حقوق المنصة</h2>
            <p className="text-slate-600 leading-relaxed">
              تمتلك منصة دكتور نفسي أونلاين كافة حقوق المحتوى والخدمات المقدمة. لا يجوز نسخ أو إعادة نشر أي محتوى بدون إذن خطي مسبق.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">3. استخدام الخدمة</h2>
            <p className="text-slate-600 leading-relaxed">
              يُمنع استخدام المنصة لأغراض غير قانونية أو مزعجة. يجب احترام سياسة السلوك المهني عند التواصل مع الأخصائيين.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">4. الدفع والاسترداد</h2>
            <p className="text-slate-600 leading-relaxed">
              تتم عمليات الدفع عبر قنوات الدفع المصرح بها داخل المنصة. لا يمكن المطالبة باسترداد الأموال بعد بدء الجلسة إلا وفق سياسة الاسترداد الخاصة بالمنصة.
            </p>
          </section>
        </div>

        <div className="space-y-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">5. مسؤولية المستخدم</h2>
            <p className="text-slate-600 leading-relaxed">
              أنت مسؤول عن المعلومات التي تقدمها أثناء التسجيل أو أثناء الجلسات. احترس من مشاركة أي بيانات حساسة خارج إطار المنصة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">6. البيانات والمحتوى</h2>
            <p className="text-slate-600 leading-relaxed">
              المحتوى الطبي والنفسي المقدم في المنصة هو معلومات عامة ولا يغني عن التشخيص الطبي أو النفسي الشخصي.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">7. التعديلات والإشعارات</h2>
            <p className="text-slate-600 leading-relaxed">
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم الإعلان عن التعديلات عبر الموقع أو البريد الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">8. القانون المعمول به</h2>
            <p className="text-slate-600 leading-relaxed">
              تخضع هذه الشروط للقوانين السارية في جمهورية مصر العربية، وأي نزاع يتم حله أمام الجهات القضائية المختصة.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-slate-950 to-slate-900 p-12 text-white shadow-lg">
        <h2 className="mb-4 text-3xl font-black">تواصل معنا</h2>
        <p className="mb-6 text-lg leading-relaxed text-slate-200">
          لأي استفسار عن الشروط والأحكام، تواصل مع فريق الدعم عبر البريد الإلكتروني أو رقم الهاتف التالي.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="mailto:support@doctornafsyonline.com" className="rounded-2xl bg-white/10 px-6 py-5 text-slate-100 transition hover:bg-white/20">
            support@doctornafsyonline.com
          </a>
          <a href="tel:+201129639257" className="rounded-2xl bg-white/10 px-6 py-5 text-slate-100 transition hover:bg-white/20">
            +201129639257
          </a>
        </div>
        <Link href="/contact" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-200">
          صفحة التواصل
        </Link>
      </section>
    </div>
  );
}
