"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, Search, Users, Printer,
  Download, Loader2, QrCode, BadgeCheck
} from "lucide-react";
import Link from "next/link";

interface StaffMember {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  jobTitle: string;
  isVerified: boolean;
  specializations: string | null;
}

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://doctornafsyonline.com";

function getRoleBadgeColor(role: string) {
  if (role === "ADMIN") return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === "ADMIN_HR") return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (role === "ADMIN_ACCOUNTING") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (role === "ADMIN_CUSTOMER_SERVICE") return "bg-rose-100 text-rose-700 border-rose-200";
  if (role === "SHIFT_LEADER") return "bg-blue-100 text-blue-700 border-blue-200";
  if (role === "THERAPIST") return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function StaffIDCard({ member }: { member: StaffMember }) {
  const verifyUrl = `${BASE_URL}/verify-staff?code=${member.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}&color=1E56A0&bgcolor=ffffff&margin=6`;

  return (
    <div
      className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col items-center relative print:break-inside-avoid print:shadow-none print:border print:border-slate-300 hover:shadow-lg transition-all duration-300 group"
      style={{ width: "260px", minHeight: "360px" }}
    >
      {/* Top accent bar */}
      <div className="w-full h-2 bg-gradient-to-r from-[#1E56A0] to-[#3a7bd5]" />

      {/* Logo */}
      <div className="pt-4 pb-1 flex flex-col items-center gap-1">
        <img
          src="/logo.jpeg"
          alt="Doctor Nafsy"
          className="h-7 w-auto object-contain rounded"
        />
        <p className="text-[9px] text-[#A3AED0] font-black font-mono tracking-widest">
          Doctor Nafsy Online
        </p>
      </div>

      {/* Divider */}
      <div className="w-24 h-[1px] bg-slate-100 my-2" />

      {/* Avatar */}
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#1E56A0]/20 border-2 border-[#1E56A0] shadow-lg flex items-center justify-center bg-slate-50">
          {member.avatar ? (
            <img
              src={encodeURI(decodeURI(member.avatar))}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-[#1E56A0]">
              {member.name.charAt(0)}
            </span>
          )}
        </div>
        {/* Verified checkmark */}
        {member.isVerified && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-[13px] font-black text-slate-900 text-center px-3 leading-tight">
        {member.name}
      </p>

      {/* Job title */}
      <div
        className={`mt-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${getRoleBadgeColor(member.role)}`}
      >
        {member.jobTitle}
      </div>

      {/* Verified badge */}
      <div
        className={`mt-2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${
          member.isVerified
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
      >
        <BadgeCheck className="w-3 h-3" />
        {member.isVerified ? "موظف معتمد ✓" : "قيد الاعتماد"}
      </div>

      {/* QR Code */}
      <div className="mt-3 mb-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
        <img
          src={qrUrl}
          alt={`QR ${member.name}`}
          className="w-[90px] h-[90px] object-contain"
        />
        <p className="text-[8px] text-[#A3AED0] font-black tracking-widest font-mono mt-1">
          SCAN TO VERIFY
        </p>
      </div>

      {/* Actions (hidden in print) */}
      <div className="mt-auto pb-3 flex gap-2 print:hidden opacity-0 group-hover:opacity-100 transition-all">
        <Link
          href={
            member.role === "THERAPIST"
              ? `/admin/therapists/badge/${member.id}`
              : `/admin/managers/badge/${member.id}`
          }
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
          title="عرض البطاقة كاملة وطباعتها"
        >
          <Printer className="w-3 h-3" /> طباعة
        </Link>
        <Link
          href={`/verify-staff?code=${member.id}`}
          target="_blank"
          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
          title="صفحة التحقق من الهوية"
        >
          <QrCode className="w-3 h-3" /> تحقق
        </Link>
      </div>
    </div>
  );
}

export default function StaffIDsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "therapist">("all");

  useEffect(() => {
    fetch("/api/admin/all-staff")
      .then((r) => r.json())
      .then((data) => {
        if (data.staff) setStaff(data.staff);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "therapist"
        ? m.role === "THERAPIST"
        : m.role !== "THERAPIST";
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B3674] flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500" />
              بطاقات هوية فريق العمل
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              بطاقات الهوية الرسمية لجميع موظفي المنصة — قابلة للطباعة ومزودة برمز QR للتحقق
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#1E56A0] hover:bg-[#174a8c] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg print:hidden"
          >
            <Printer className="w-5 h-5" />
            طباعة الكل
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1E56A0]">{staff.length}</p>
            <p className="text-xs text-slate-500 font-medium">إجمالي الموظفين</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-600">
              {staff.filter((s) => s.isVerified).length}
            </p>
            <p className="text-xs text-slate-500 font-medium">موظف معتمد</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-teal-600">
              {staff.filter((s) => s.role === "THERAPIST").length}
            </p>
            <p className="text-xs text-slate-500 font-medium">أخصائي</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-600">
              {staff.filter((s) => s.role !== "THERAPIST").length}
            </p>
            <p className="text-xs text-slate-500 font-medium">إداري</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الوظيفة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "admin", "therapist"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                filter === f
                  ? "bg-[#1E56A0] text-white border-[#1E56A0] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f === "all" ? "الكل" : f === "admin" ? "الإداريين" : "الأخصائيين"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">لا يوجد موظفون مطابقون للبحث</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5 justify-start print:gap-4">
          {filtered.map((member) => (
            <StaffIDCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
