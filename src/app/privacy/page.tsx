import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <section className="mb-16 rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
        <span className="mb-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          سياسة الخصوصية
        </span>
        <h1 className="mb-6 text-5xl font-black text-slate-900">سياسة الخصوصية لمنصة دكتور نفسي أونلاين</h1>
        <p className="text-lg leading-relaxed text-slate-600">
          نحن في منصة دكتور نفسي أونلاين نلتزم بحماية بياناتك واحترام خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات الخاصة بك.
        </p>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">1. البيانات التي نجمعها</h2>
            <p className="text-slate-600 leading-relaxed">
              نجمع بيانات التسجيل الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف، بالإضافة إلى المعلومات المتعلقة بالحجز والجلسات لتحسين تجربتك.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">2. استخدام البيانات</h2>
            <p className="text-slate-600 leading-relaxed">
              نستخدم بياناتك لتقديم الخدمات، التواصل معك، وإرسال التحديثات والعروض المرتبطة بخدماتنا. لن نشارك بياناتك مع أطراف ثالثة بدون إذن واضح منك.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">3. الأمان</h2>
            <p className="text-slate-600 leading-relaxed">
              نعتمد على إجراءات أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الضياع.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">4. ملفات تعريف الارتباط</h2>
            <p className="text-slate-600 leading-relaxed">
              قد نستخدم ملفات تعريف الارتباط لتحسين تجربتك داخل المنصة وتحليل أداء الموقع. يمكنك تعديل تفضيلات المتصفح للتحكم في هذه الملفات.
            </p>
          </section>
        </div>

        <div className="space-y-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">5. مشاركة المعلومات</h2>
            <p className="text-slate-600 leading-relaxed">
              نشارك البيانات فقط مع مقدمي الخدمات الضروريين لتشغيل الموقع أو عند طلب قانوني. لا نبيع بياناتك لأي جهة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">6. حقوقك</h2>
            <p className="text-slate-600 leading-relaxed">
              يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها. نعمل على احترام طلباتك ضمن الأطر القانونية المعمول بها.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">7. تحديثات السياسة</h2>
            <p className="text-slate-600 leading-relaxed">
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإعلامك بأي تغييرات مهمة عبر الموقع أو البريد الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl font-bold text-slate-900">8. كيفية الاتصال بنا</h2>
            <p className="text-slate-600 leading-relaxed">
              لأي سؤال حول سياسة الخصوصية، يرجى التواصل معنا عبر support@doctornafsyonline.com أو الهاتف +201129639257.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-slate-950 to-slate-900 p-12 text-white shadow-lg">
        <h2 className="mb-4 text-3xl font-black">نحن هنا لمساعدتك</h2>
        <p className="mb-6 text-lg leading-relaxed text-slate-200">
          إذا كان لديك استفسار حول بياناتك أو الخصوصية، فريق الدعم جاهز للإجابة عبر البريد أو الهاتف.
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
