"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Calendar, Settings, 
  MessageCircle, CreditCard, Menu, X, 
  LogOut, Bell, Search, UserIcon, ShieldCheck, Activity, BookOpen
} from "lucide-react";
import { signOut } from "next-auth/react";

type Role = "PATIENT" | "THERAPIST" | "ADMIN" | "ADMIN_HR" | "ADMIN_ACCOUNTING" | "ADMIN_VIEWER" | string;

const getRoleLabel = (role: string) => {
  if (role === "ADMIN") return "مدير عام";
  if (role === "ADMIN_HR") return "مدير HR";
  if (role === "ADMIN_ACCOUNTING") return "مدير حسابات";
  if (role === "ADMIN_VIEWER") return "مراقب الإدارة 🔍";
  if (role === "THERAPIST") return "أخصائي";
  return "مريض";
};

export function DashboardLayout({
  children,
  role,
  userName = "مستخدم",
}: {
  children: React.ReactNode;
  role: Role;
  userName?: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";

  // اغلق القائمة عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  let navItems: { name: string; href: string; icon: React.ReactNode }[] = [];

  if (role === "PATIENT") {
    navItems = [
      { name: "الرئيسية", href: "/patient/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "مواعيدي", href: "/patient/appointments", icon: <Calendar className="h-5 w-5" /> },
      { name: "الإشعارات", href: "/patient/notifications", icon: <Bell className="h-5 w-5" /> },
      { name: "الرسائل", href: "/patient/messages", icon: <MessageCircle className="h-5 w-5" /> },
      { name: "الفواتير", href: "/patient/billing", icon: <CreditCard className="h-5 w-5" /> },
      { name: "الملف الشخصي", href: "/patient/profile", icon: <UserIcon className="h-5 w-5" /> },
    ];
  } else if (role === "THERAPIST") {
    navItems = [
      { name: "الرئيسية", href: "/therapist/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "المرضى", href: "/therapist/patients", icon: <Users className="h-5 w-5" /> },
      { name: "الجدول", href: "/therapist/schedule", icon: <Calendar className="h-5 w-5" /> },
      { name: "الرسائل", href: "/therapist/messages", icon: <MessageCircle className="h-5 w-5" /> },
      { name: "الملف الشخصي", href: "/therapist/profile", icon: <UserIcon className="h-5 w-5" /> },
      { name: "الإعدادات", href: "/therapist/settings", icon: <Settings className="h-5 w-5" /> },
    ];
  } else if (role?.startsWith("ADMIN")) {
    const allAdminNavItems = [
      { name: "الرئيسية", href: "/admin/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "إدارة المديرين 👑", href: "/admin/managers", icon: <ShieldCheck className="h-5 w-5" />, roles: ["ADMIN"] },
      { name: "إدارة الجلسات والعمليات 📅", href: "/admin/operations", icon: <Activity className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_HR", "ADMIN_VIEWER"] },
      { name: "توثيق واعتماد الأخصائيين ✅", href: "/admin/therapists", icon: <ShieldCheck className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_HR", "ADMIN_VIEWER"] },
      { name: "إدارة المرضى 👥", href: "/admin/patients", icon: <Users className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_HR", "ADMIN_VIEWER"] },
      { name: "اعتماد التحويلات المالية 💰", href: "/admin/reports", icon: <CreditCard className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_ACCOUNTING", "ADMIN_VIEWER"] },
      { name: "المقالات والتقييمات 📝", href: "/admin/content", icon: <BookOpen className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_VIEWER"] },
      { name: "الدعم، الإشعارات وأكواد الخصم 🎟️", href: "/admin/marketing", icon: <MessageCircle className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_VIEWER"] },
      { name: "إعدادات المنصة ⚙️", href: "/admin/settings", icon: <Settings className="h-5 w-5" />, roles: ["ADMIN", "ADMIN_VIEWER"] },
    ];
    navItems = allAdminNavItems.filter(item => !item.roles || item.roles.includes(role as string));
  }

  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : "م";

  return (
    <div className="bg-[#F4F7FE] min-h-screen flex text-slate-900 font-sans" dir="rtl">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[72px] bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img src="/logo.jpeg" alt="Logo" className="h-9 w-auto object-contain rounded-lg" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-slate-100 text-slate-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-800 bg-slate-100 rounded-full transition-colors">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Universal Sidebar Overlay (Drawer for all screens) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-[280px] bg-[#0B1437] h-full shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 mt-2 flex flex-col items-center relative">
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="absolute top-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <Link href="/" className="inline-block transition-transform hover:scale-105 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
                <img src="/logo.jpeg" alt="Logo" className="h-10 w-auto object-contain rounded-lg" />
              </Link>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg shadow-indigo-500/30">
                {userInitials}
              </div>
              <div className="font-bold text-white text-lg">{userName}</div>
              <div className="text-xs text-indigo-300 mt-1">{getRoleLabel(role)}</div>
              {role === "ADMIN_VIEWER" && (
                <div className="mt-2 px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-[10px] text-amber-300 font-bold">عرض فقط — لا يمكن التعديل</div>
              )}
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all font-medium ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className={`${isActive ? "text-white" : "text-slate-400"} transition-colors`}>
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-white/10 mt-auto">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center justify-center gap-3 w-full px-4 py-3.5 text-rose-400 font-bold rounded-2xl hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20"
              >
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area (Full width now) */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        
        {/* Topbar (Desktop Only) */}
        <header className="hidden md:flex h-24 items-center justify-between px-8 bg-transparent sticky top-0 z-10 backdrop-blur-md bg-white/40 border-b border-slate-200/50">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2.5 text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-black text-[#2B3674] tracking-tight">
              {navItems.find(i => pathname === i.href || pathname.startsWith(`${i.href}/`))?.name || "لوحة التحكم"}
            </h2>
          </div>
          
          <div className="flex items-center gap-6 bg-white p-2 rounded-[30px] shadow-sm border border-slate-100">
            {/* Search Input */}
            <div className="relative flex items-center bg-[#F4F7FE] rounded-full px-4 py-2 w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-4" />
              <input 
                type="text" 
                placeholder="ابحث هنا..." 
                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full pr-7 placeholder:text-slate-400 font-medium"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full hover:bg-[#F4F7FE] text-slate-500 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-2 border-r border-slate-100 mr-2 pr-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-[#2B3674]">{userName}</span>
                <span className="text-xs font-semibold text-slate-400">{getRoleLabel(role)}</span>
                {role === "ADMIN_VIEWER" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">عرض فقط</span>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pt-24 md:pt-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
