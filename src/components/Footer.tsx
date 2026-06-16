import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/95 px-4 py-8 text-sm text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">دكتور نفسى اونلاين</p>
          <p className="max-w-xl leading-relaxed text-slate-600">
            منصة علاج نفسى عربية آمنة وسهلة الاستخدام. جلسات صوت وفيديو وشات داخل المنصة بخصوصية تامة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-slate-600">
          <Link href="/about" className="transition hover:text-emerald-700">
            من نحن
          </Link>
          <Link href="/services" className="transition hover:text-emerald-700">
            الخدمات
          </Link>
          <Link href="/contact" className="transition hover:text-emerald-700">
            تواصل معنا
          </Link>
          <Link href="/faq" className="transition hover:text-emerald-700">
            الأسئلة الشائعة
          </Link>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-200 pt-4 text-center text-slate-500">
        © 2026 دكتور نفسى اونلاين. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
