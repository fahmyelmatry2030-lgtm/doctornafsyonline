"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // التحقق مما إذا كان المسار الحالي ينتمي إلى أي من لوحات التحكم
  const isDashboard = 
    pathname?.startsWith("/admin/") || pathname === "/admin" ||
    pathname?.startsWith("/patient/") || pathname === "/patient" ||
    pathname?.startsWith("/therapist/") || pathname === "/therapist" ||
    pathname === "/dashboard";

  return (
    <div className={`min-h-screen flex flex-col w-full ${isDashboard ? 'bg-[#F4F7FE]' : 'bg-white'}`}>
      {!isDashboard && header}
      <main className="flex-1 w-full">{children}</main>
      {!isDashboard && footer}
    </div>
  );
}
