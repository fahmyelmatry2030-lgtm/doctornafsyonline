"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  Home,
  Calendar,
  MessageCircle,
  FileText,
  CreditCard,
  Settings,
  Users,
  BookOpen,
  BarChart2,
  Star
} from "lucide-react";
import { signOut } from "next-auth/react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "PATIENT" | "THERAPIST" | "ADMIN";
  userName: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define nav links based on role
  let navItems: NavItem[] = [];

  if (role === "PATIENT") {
    navItems = [
      { name: "الرئيسية", href: "/patient/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "مواعيدي", href: "/patient/appointments", icon: <Calendar className="h-5 w-5" /> },
      { name: "الإشعارات", href: "/patient/notifications", icon: <Bell className="h-5 w-5" /> },
      { name: "الرسائل", href: "/patient/messages", icon: <MessageCircle className="h-5 w-5" /> },
      { name: "التقييمات", href: "/patient/reviews", icon: <Star className="h-5 w-5" /> },
      { name: "الفواتير", href: "/patient/billing", icon: <CreditCard className="h-5 w-5" /> },
      { name: "الملف الشخصي", href: "/patient/profile", icon: <UserIcon className="h-5 w-5" /> },
    ];
  } else if (role === "THERAPIST") {
    navItems = [
      { name: "الرئيسية", href: "/therapist/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "الجدول والمواعيد", href: "/therapist/schedule", icon: <Calendar className="h-5 w-5" /> },
      { name: "المرضى", href: "/therapist/patients", icon: <Users className="h-5 w-5" /> },
      { name: "الرسائل", href: "/therapist/messages", icon: <MessageCircle className="h-5 w-5" /> },
      { name: "الأرباح", href: "/therapist/earnings", icon: <CreditCard className="h-5 w-5" /> },
      { name: "الإعدادات", href: "/therapist/settings", icon: <Settings className="h-5 w-5" /> },
    ];
  } else if (role === "ADMIN") {
    navItems = [
      { name: "لوحة القيادة",          href: "/admin/dashboard",  icon: <Home className="h-5 w-5" /> },
      { name: "إدارة الأخصائيين",       href: "/admin/therapists", icon: <Users className="h-5 w-5" /> },
      { name: "إدارة المرضى",           href: "/admin/patients",   icon: <UserIcon className="h-5 w-5" /> },
      { name: "العمليات والمدفوعات",    href: "/admin/operations", icon: <FileText className="h-5 w-5" /> },
      { name: "التقارير والتحليلات",    href: "/admin/reports",    icon: <BarChart2 className="h-5 w-5" /> },
      { name: "المقالات والتقييمات",   href: "/admin/content",    icon: <BookOpen className="h-5 w-5" /> },
      { name: "التسويق والدعم الفني",  href: "/admin/marketing",  icon: <MessageCircle className="h-5 w-5" /> },
      { name: "إعدادات الموقع",         href: "/admin/settings",   icon: <Settings className="h-5 w-5" /> },
    ];
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex text-slate-900" dir="rtl">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-l border-slate-200 fixed inset-y-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img src="/logo.jpeg" alt="Logo" className="h-10 w-auto object-contain rounded-xl" />
          </Link>
          <div className="mt-2 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 w-fit px-3 py-1 rounded-full">
            {role === "PATIENT" ? "بوابة المريض" : role === "THERAPIST" ? "بوابة الأخصائي" : "لوحة الإدارة"}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-gradient-to-r from-[#6366F1]/10 to-transparent text-[#6366F1] border-r-4 border-[#6366F1]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-r-4 border-transparent"
                }`}
              >
                <div className={`${isActive ? "text-[#6366F1]" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img src="/logo.jpeg" alt="Logo" className="h-8 w-auto object-contain rounded-lg" />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 mt-16">
              <div className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 w-fit px-3 py-1 rounded-full mb-2">
                {role === "PATIENT" ? "بوابة المريض" : role === "THERAPIST" ? "بوابة الأخصائي" : "لوحة الإدارة"}
              </div>
              <div className="font-bold text-slate-800">{userName}</div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive 
                        ? "bg-[#6366F1]/10 text-[#6366F1]" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen md:pr-72 pt-16 md:pt-0">
        {/* Topbar (Desktop) */}
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-lg font-bold text-slate-800">
            {/* Can dynamically show page title here if needed */}
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
                <p className="text-xs text-slate-500">{role === "PATIENT" ? "مريض" : role === "THERAPIST" ? "أخصائي" : "مدير النظام"}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
