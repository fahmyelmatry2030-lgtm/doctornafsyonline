import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Heart, LayoutDashboard, LogOut, User, Menu } from "lucide-react";
import { getSettings } from "@/app/admin/settings/actions";

export async function Header() {
  const [session, settings] = await Promise.all([
    auth(),
    getSettings()
  ]);

  const platformName = settings?.platformName || "دكتور نفسي";

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-indigo-100/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <img src="/logo.jpeg" alt={platformName} className="h-12 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105 rounded-xl" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "/about", label: "من نحن" },
            { href: "/services", label: "الخدمات" },
            { href: "/how-it-works", label: "كيف تعمل" },
            { href: "/therapists", label: "الأخصائيين" },
            { href: "/blog", label: "المدونة" },
            { href: "/faq", label: "الأسئلة" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 transition-premium hover:text-indigo-600 hover:bg-indigo-50/60 rounded-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 transition-premium hover:bg-indigo-100 border border-indigo-200"
              >
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full border-2 border-indigo-200 hover:border-indigo-300 px-4 py-2 text-sm font-medium text-slate-600 transition-premium hover:bg-indigo-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-premium hover:bg-indigo-50"
              >
                <User className="h-4 w-4" />
                دخول
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2 text-sm font-bold text-white transition-premium hover:shadow-premium hover:scale-105"
              >
                <span className="hidden sm:inline">ابدأ الآن</span>
                <span className="sm:hidden">التسجيل</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
