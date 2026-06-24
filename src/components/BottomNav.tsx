"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("Navigation");
  
  const prefix = locale === "en" ? "/en" : "";

  const NAV_ITEMS = [
    { href: `${prefix}/`, icon: Home, label: locale === "en" ? "Home" : "الرئيسية", exact: true },
    { href: `${prefix}/therapists`, icon: Users, label: t("therapists"), exact: false },
    { 
      href: session?.user ? `${prefix}/dashboard` : `${prefix}/login`, 
      icon: session?.user ? LayoutDashboard : User, 
      label: session?.user ? t("dashboard") : t("login"),
      exact: false
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href || pathname === `${item.href}/`
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-[#4318FF]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-[#4318FF]/20 text-[#4318FF]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] font-bold ${isActive ? "text-[#4318FF]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
