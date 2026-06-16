import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Heart, LayoutDashboard, LogOut, User, Menu } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-teal-600 text-white group-hover:shadow-lg transition">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-lg font-black text-slate-900 group-hover:text-slate-700 transition">
            دكتور نفسى
          </span>
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
              className="px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-teal-700 hover:bg-teal-50 rounded-lg"
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
                className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 border border-slate-200"
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
                  className="flex items-center gap-2 rounded-full border-2 border-slate-200 hover:border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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
                className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
              >
                <User className="h-4 w-4" />
                دخول
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-slate-800 to-teal-600 px-5 py-2 text-sm font-bold text-white transition hover:shadow-lg hover:scale-105"
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
