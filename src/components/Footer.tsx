import Link from "next/link";
import { Heart, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#1E1B3A] text-gray-300">
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-premium transition-premium group-hover:shadow-premium-lg">
                <Heart className="h-5 w-5 fill-white text-white" />
              </div>
              <span className="text-lg font-black text-white">
                دكتور نفسى
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              منصة علاج نفسى عربية آمنة وسهلة الاستخدام. جلسات صوت وفيديو وشات داخل المنصة بخصوصية تامة.
            </p>
            <p className="text-sm font-medium text-indigo-300">
              صحتك النفسية أولوية، ونحن هنا لمساعدتك ✦
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "من نحن" },
                { href: "/services", label: "الخدمات" },
                { href: "/how-it-works", label: "كيف تعمل" },
                { href: "/therapists", label: "الأخصائيين" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              الدعم والمساعدة
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/faq", label: "الأسئلة الشائعة" },
                { href: "/contact", label: "تواصل معنا" },
                { href: "/blog", label: "المدونة" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & CTA */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              تواصل معنا
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                support@nafsi.com
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                +20 100 000 0000
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                القاهرة، مصر
              </li>
            </ul>
            <Link
              href="/register"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-premium hover:shadow-premium-lg hover:scale-105"
            >
              ابدأ رحلتك الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © 2026 دكتور نفسى اونلاين. جميع الحقوق محفوظة.
          </p>
          <p className="text-sm text-indigo-400/70">
            صُنع بعناية لصحتك النفسية
          </p>
        </div>
      </div>
    </footer>
  );
}
