"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface TherapistData {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  specializations: string | null;
  isVerified: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TherapistBadgePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const therapistId = resolvedParams.id;

  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/staff-badge/${therapistId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTherapist(data);
        }
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, [therapistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg">لم يتم العثور على الأخصائي</p>
          <Link href="/admin/therapists" className="text-indigo-600 text-sm mt-4 block hover:underline">
            العودة للأخصائيين
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctornafsyonline.com";
  const verificationUrl = `${baseUrl}/verify-staff?code=${therapist.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
  const isVerified = therapist.isVerified;
  const specializations = therapist.specializations || "أخصائي نفسي";

  return (
    <div className="min-h-screen bg-slate-100 py-10 flex flex-col items-center justify-center font-sans print:bg-white print:py-0">

      {/* Control Panel (Hidden during print) */}
      <div className="w-[380px] mb-6 flex justify-between items-center print:hidden px-4">
        <Link href="/admin/therapists" className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>الرجوع للأخصائيين</span>
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
            {therapist.avatar ? (
              <img src={encodeURI(decodeURI())} alt={therapist.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-black text-[#1E56A0]">
                {therapist.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Verified Badge */}
        <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-full font-extrabold text-sm mb-4 ${
          isVerified
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          <ShieldCheck className={`w-5 h-5 shrink-0 ${isVerified ? "text-emerald-600" : "text-amber-500"}`} />
          <span className="tracking-wide">{isVerified ? "Verified ✓" : "Pending Verification"}</span>
        </div>

        {/* Info Cards */}
        <div className="w-full space-y-3.5 px-4 mb-6">
          <div className="bg-[#1E56A0] text-white text-center py-3.5 px-6 rounded-2xl shadow-sm">
            <p className="text-lg font-black tracking-wide leading-none">{therapist.name}</p>
          </div>
          <div className="bg-[#1E56A0] text-white text-center py-3 px-6 rounded-2xl shadow-sm">
            <p className="text-sm font-black tracking-wider leading-none">Clinical Specialist</p>
          </div>
          {specializations && (
            <div className="bg-slate-100 text-slate-700 text-center py-2.5 px-6 rounded-2xl">
              <p className="text-xs font-bold">{specializations}</p>
            </div>
          )}
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
