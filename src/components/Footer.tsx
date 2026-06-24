import Link from "next/link";
import { Heart, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { getSettings } from "@/app/admin/settings/actions";
import { PLATFORM_PHONE, PLATFORM_PHONE_TEL } from "@/lib/constants";

export async function Footer() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch (error) {
    console.error("Failed to load footer settings:", error);
  }
  const platformName = settings?.platformName || "دكتور نفسي";

  return (
    <footer className="relative bg-[#1E1B3A] text-gray-300">
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img src="/logo.jpeg?v=2" alt={platformName} className="h-12 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105 rounded-xl" />
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
                { href: "/how-it-works", label: "خطة التعافي" },
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
                { href: "/blog", label: "المقالات" },
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
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <a href="mailto:support@doctornafsyonline.com" className="text-white font-semibold hover:text-indigo-300 transition-colors">
                  support@doctornafsyonline.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <a href={PLATFORM_PHONE_TEL} className="text-white font-semibold hover:text-indigo-300 transition-colors">
                  {PLATFORM_PHONE}
                </a>
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
            © 2026 {platformName}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          </div>
          <p className="text-sm text-indigo-400/70">
            صُنع بعناية لصحتك النفسية
          </p>
        </div>
      </div>
    </footer>
  );
}
