"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, User, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslations } from "next-intl";

export function Header({ platformName = "دكتور نفسي", locale = "ar" }: { platformName?: string; locale?: string }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Navigation");

  // Use locale prop (from server) - reliable, works during SSR
  const isEnglish = locale === "en";
  const prefix = isEnglish ? "/en" : "";

  // Switch language using actual URL
  const switchLanguage = () => {
    if (isEnglish) {
      // English → Arabic: remove /en prefix
      const arPath = window.location.pathname.replace(/^\/en/, "") || "/";
      window.location.href = arPath;
    } else {
      // Arabic → English: add /en prefix
      const enPath = "/en" + (window.location.pathname === "/" ? "" : window.location.pathname);
      window.location.href = enPath;
    }
  };

  const NAV_LINKS = [
    { href: `${prefix}/how-it-works`, label: t("howItWorks") },
    { href: `${prefix}/services`,     label: t("services") },
    { href: `${prefix}/therapists`,   label: t("therapists") },
    { href: `${prefix}/blog`,         label: t("blog") },
    { href: `${prefix}/about`,        label: t("about") },
    { href: `${prefix}/faq`,          label: t("faq") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="mx-auto flex h-20 sm:h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 transition-opacity hover:opacity-80">
            <img
              src="/logo.png?v=3"
              alt={platformName}
              className="h-[65px] sm:h-[80px] w-auto object-contain drop-shadow-sm pb-1"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] font-bold text-slate-600 transition-colors hover:text-[#4318FF] relative group"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#4318FF] transition-all group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Right side: auth buttons + hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Language Switcher */}
            <button
              onClick={switchLanguage}
              title={isEnglish ? "التبديل للعربية" : "Switch to English"}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-all hover:border-[#4318FF] hover:text-[#4318FF] hover:bg-[#F4F7FE]"
            >
              <Globe className="h-4 w-4" />
              <span>{isEnglish ? "ع" : "EN"}</span>
            </button>

            
            {/* Auth buttons (desktop) */}
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 rounded-xl bg-[#F4F7FE] px-5 py-2.5 text-sm font-bold text-[#4318FF] transition-all hover:bg-[#E0E7FF] hover:shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("dashboard")}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-slate-100 hover:border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-bold text-slate-700 transition-colors hover:text-[#4318FF] hover:bg-[#F4F7FE]"
                >
                  <User className="h-4 w-4" />
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:flex items-center gap-2 rounded-xl bg-[#4318FF] px-6 py-2.5 text-[15px] font-black text-white shadow-lg shadow-[#4318FF]/20 transition-all hover:bg-[#3311DB] hover:-translate-y-0.5"
                >
                  {t("register")}
                </Link>
              </>
            )}

            {/* Hamburger button (mobile only) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl border-2 border-slate-100 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              aria-label="فتح القائمة"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl shadow-lg">
            <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-[15px] font-bold text-slate-700 hover:text-[#4318FF] hover:bg-[#F4F7FE] transition-all"
                >
                  {item.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="my-2 border-t border-slate-100" />

              {/* Auth buttons (mobile) */}
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] font-bold text-[#4318FF] hover:bg-[#F4F7FE] transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] font-bold text-slate-700 hover:text-[#4318FF] hover:bg-[#F4F7FE] transition-all"
                  >
                    <User className="h-4 w-4" />
                    دخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mx-4 py-3 rounded-xl bg-[#4318FF] text-[15px] font-black text-white shadow-lg shadow-[#4318FF]/20 transition-all hover:bg-[#3311DB]"
                  >
                    ابدأ الآن
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
