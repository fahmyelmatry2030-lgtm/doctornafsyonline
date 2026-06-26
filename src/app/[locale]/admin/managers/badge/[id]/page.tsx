"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface ManagerData {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  isVerified: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function getRoleEnglishLabel(role: string) {
  if (role === "ADMIN") return "System Administrator";
  if (role === "ADMIN_HR") return "Human Resources";
  if (role === "ADMIN_ACCOUNTING") return "Financial Manager";
  if (role === "ADMIN_VIEWER") return "Management Monitor";
  if (role === "SHIFT_LEADER") return "Shift Leader";
  if (role === "ADMIN_CUSTOMER_SERVICE") return "Customer Service";
  return "Staff Member";
}

export default function ManagerBadgePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const managerId = resolvedParams.id;

  const [manager, setManager] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/staff-badge/${managerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setManager(data);
        }
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, [managerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg">لم يتم العثور على المدير</p>
          <Link href="/admin/managers" className="text-indigo-600 text-sm mt-4 block hover:underline">
            العودة للمديرين
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctornafsyonline.com";
  const verificationUrl = `${baseUrl}/verify-staff?code=${manager.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div className="min-h-screen bg-slate-100 py-10 flex flex-col items-center justify-center font-sans print:bg-white print:py-0">

      {/* Control Panel (Hidden during print) */}
      <div className="w-[380px] mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/admin/managers" className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>الرجوع للمديرين</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة البطاقة</span>
        </button>
      </div>

      {/* Styled Printable Badge Container */}
      <div className="w-[380px] min-h-[640px] bg-white rounded-[2.5rem] shadow-xl border border-slate-200/80 p-8 flex flex-col items-center justify-between relative overflow-hidden print:shadow-none print:border-none print:m-0 print:rounded-none print:w-full">

        {/* Doctor Nafsy Logo Header */}
        <div className="flex flex-col items-center space-y-1.5 text-center mt-2">
          <div className="h-14 w-auto flex items-center justify-center">
            <img src="/logo.png?v=5" alt="Doctor Nafsy" className="h-12 w-auto object-contain rounded-lg" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-black text-slate-800 tracking-wide">دكتور نفسي أونلاين</p>
            <p className="text-[10px] text-[#A3AED0] font-extrabold font-mono tracking-wider">Doctor Nafsy Online</p>
          </div>
        </div>

        {/* Profile Avatar Frame with blue ring */}
        <div className="relative my-6">
          <div className="h-40 w-40 rounded-full overflow-hidden border-[6px] border-white ring-4 ring-[#1E56A0] shadow-[0_10px_25px_rgba(30,86,160,0.15)] flex items-center justify-center bg-slate-50">
            {manager.avatar ? (
              <img src={encodeURI(decodeURI(manager.avatar))} alt={manager.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-black text-[#1E56A0]">
                {manager.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Verified Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-extrabold text-sm mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="tracking-wide">Verified ✓</span>
        </div>

        {/* Info Cards */}
        <div className="w-full space-y-3.5 px-4 mb-6">
          <div className="bg-[#1E56A0] text-white text-center py-3.5 px-6 rounded-2xl shadow-sm">
            <p className="text-lg font-black tracking-wide leading-none">{manager.name}</p>
          </div>
          <div className="bg-[#1E56A0] text-white text-center py-3 px-6 rounded-2xl shadow-sm">
            <p className="text-sm font-black tracking-wider leading-none">{getRoleEnglishLabel(manager.role)}</p>
          </div>
        </div>

        {/* QR Code section */}
        <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-100 rounded-[2rem] w-fit mx-auto mb-2">
          <img src={qrCodeUrl} alt="Verification QR" className="w-[110px] h-[110px] object-contain" />
          <span className="text-[8px] text-[#A3AED0] font-black tracking-widest font-mono mt-1">SCAN TO VERIFY</span>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
