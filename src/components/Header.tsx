import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { getSettings } from "@/app/admin/settings/actions";

export async function Header() {
  const [session, settings] = await Promise.all([
    auth(),
    getSettings()
  ]);

  const platformName = settings?.platformName || "دكتور نفسي";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group transition-transform hover:opacity-80">
          <img 
            src="/logo.jpeg" 
            alt={platformName} 
            className="h-14 w-auto object-contain" 
            style={{ mixBlendMode: 'multiply' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
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
              className="text-[15px] font-bold text-slate-600 transition-colors hover:text-[#4318FF] relative group"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#4318FF] transition-all group-hover:w-full rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-xl bg-[#F4F7FE] px-5 py-2.5 text-sm font-bold text-[#4318FF] transition-all hover:bg-[#E0E7FF] hover:shadow-sm"
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
                  className="flex items-center gap-2 rounded-xl border-2 border-slate-100 hover:border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
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
                className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-bold text-slate-700 transition-colors hover:text-[#4318FF] hover:bg-[#F4F7FE]"
              >
                <User className="h-4 w-4" />
                دخول
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-[#4318FF] px-6 py-2.5 text-[15px] font-black text-white shadow-lg shadow-[#4318FF]/20 transition-all hover:bg-[#3311DB] hover:-translate-y-0.5"
              >
                ابدأ الآن
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
