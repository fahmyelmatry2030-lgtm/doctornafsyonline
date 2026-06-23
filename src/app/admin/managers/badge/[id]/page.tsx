import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ShieldCheck, Award, Printer, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManagerBadgePage({ params }: PageProps) {
  const session = await auth();
  
  // Only allow admin roles to print badges
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_HR")) {
    redirect("/admin/dashboard");
  }

  const resolvedParams = await params;
  const managerId = resolvedParams.id;

  const manager = await prisma.user.findFirst({
    where: {
      id: managerId,
      role: {
        in: ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", "SHIFT_LEADER", "ADMIN_CUSTOMER_SERVICE"]
      }
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    }
  });

  if (!manager) {
    notFound();
  }

  // Get English label for UI matching the screenshot
  const getRoleEnglishLabel = (role: string) => {
    if (role === "ADMIN") return "System Administrator";
    if (role === "ADMIN_HR") return "Human Resources";
    if (role === "ADMIN_ACCOUNTING") return "Financial Manager";
    if (role === "ADMIN_VIEWER") return "Management Monitor";
    if (role === "SHIFT_LEADER") return "Shift Leader";
    if (role === "ADMIN_CUSTOMER_SERVICE") return "Customer Service";
    return "Staff Member";
  };

  // Construct verification URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://doctornafsyonline.com";
  const verificationUrl = `${baseUrl}/verify-staff?code=${manager.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="min-h-screen bg-slate-100 py-10 flex flex-col items-center justify-center font-sans">
      
      {/* Control Panel (Hidden during print) */}
      <div className="w-[380px] mb-6 flex justify-between items-center no-print px-4">
        <Link href="/admin/managers" className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للمديرين</span>
        </Link>
        <button
          onClick="window.print()"
          // Since it's a Server Component, we can use a client-side button click wrapper or standard script or just a simple custom JS injection:
          // But to avoid complex hydration mismatch in Server Components, we will use a small script or link. Let's make this page a client component if needed, or simply render standard button that calls window.print() inside a browser execution:
          className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-102"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة البطاقة</span>
        </button>
      </div>

      {/* Styled Printable Badge Container */}
      <div className="w-[380px] min-h-[640px] bg-white rounded-[2.5rem] shadow-xl border border-slate-200/80 p-8 flex flex-col items-center justify-between relative overflow-hidden print:shadow-none print:border-none print:m-0 print:rounded-none">
        
        {/* Doctor Nafsy Logo Header */}
        <div className="flex flex-col items-center space-y-1.5 text-center mt-2">
          {/* Logo Icon SVG or Image */}
          <div className="h-14 w-auto flex items-center justify-center">
            <img src="/logo.jpeg" alt="Doctor Nafsy" className="h-12 w-auto object-contain rounded-lg" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-black text-slate-800 tracking-wide">دكتور نفسي أونلاين</p>
            <p className="text-[10px] text-[#A3AED0] font-extrabold font-mono tracking-wider">Doctor Nafsy Online</p>
          </div>
        </div>

        {/* Profile Avatar Frame with blue ring */}
        <div className="relative my-6">
          <div className="h-40 w-40 rounded-full overflow-hidden border-[6px] border-white ring-4 ring-[#1E56A0] shadow-[0_10px_25px_rgba(30,86,160,0.15)] flex items-center justify-center bg-slate-50">
            <img
              src={manager.avatar || "/therapist-placeholder.png"}
              alt={manager.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<span class="flex h-full w-full items-center justify-center text-4xl font-black text-[#1E56A0]">${manager.name.charAt(0)}</span>`;
              }}
            />
          </div>
        </div>

        {/* Verified Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-extrabold text-sm mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="tracking-wide">Verified</span>
        </div>

        {/* Info Cards (Blue rounded pill boxes) */}
        <div className="w-full space-y-3.5 px-4 mb-6">
          {/* Name Box */}
          <div className="bg-[#1E56A0] text-white text-center py-3.5 px-6 rounded-2xl shadow-sm">
            <p className="text-lg font-black tracking-wide leading-none">{manager.name}</p>
          </div>
          {/* Title Box */}
          <div className="bg-[#1E56A0] text-white text-center py-3 px-6 rounded-2xl shadow-sm">
            <p className="text-sm font-black tracking-wider leading-none">{getRoleEnglishLabel(manager.role)}</p>
          </div>
        </div>

        {/* QR Code section in the bottom white space */}
        <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-100 rounded-[2rem] w-fit mx-auto mb-2">
          <img 
            src={qrCodeUrl} 
            alt="Verification QR" 
            className="w-[110px] h-[110px] object-contain"
          />
          <span className="text-[8px] text-[#A3AED0] font-black tracking-widest font-mono mt-1">SCAN TO VERIFY</span>
        </div>

      </div>

      {/* Embedded print logic styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Embedded client-side script for window.print support */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Enable client-side printing easily without dynamic component overhead
          document.addEventListener('DOMContentLoaded', () => {
            const btn = document.querySelector('button');
            if (btn) {
              btn.addEventListener('click', () => {
                window.print();
              });
            }
          });
        `
      }} />
    </div>
  );
}
