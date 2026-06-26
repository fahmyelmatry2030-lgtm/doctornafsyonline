"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function ReceiptTemplatePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl shadow-2xl p-12 relative print:shadow-none print:w-[210mm] print:h-[297mm] print:p-10">
        
        {/* Print Button (hidden in print mode) */}
        <div className="absolute top-4 left-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <Printer size={20} />
            طباعة / حفظ كـ PDF
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full border-[6px] border-slate-900 p-8 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <h1 className="text-3xl font-black text-red-600 underline underline-offset-8 mx-auto text-center mt-8">
              إقرار استلام مستحقات
            </h1>
          </div>

          {/* Body */}
          <div className="space-y-12 text-xl font-bold leading-relaxed text-slate-800">
            <div className="flex items-center flex-wrap gap-2">
              <span>أقر أنا /</span>
              <span className="flex-1 border-b-2 border-dotted border-slate-500 min-w-[200px]"></span>
              <span>بصفتي (موظفًا / متعاقدًا / مقدم خدمة)</span>
            </div>

            <div className="flex items-center gap-2">
              <span>لدى منصة</span>
              <span className="text-indigo-600 font-black">دكتور نفسي أونلاين</span>
              <span>، بأنني قد استلمت كافة مستحقاتي المالية والمكافآت الشهرية</span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <span>عن شهر (</span>
              <span className="w-32 border-b-2 border-dotted border-slate-500"></span>
              <span>) في تاريخ</span>
              <span className="w-24 border-b-2 border-dotted border-slate-500"></span>
              <span>/</span>
              <span className="w-24 border-b-2 border-dotted border-slate-500"></span>
              <span>/ 2026</span>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="mt-32 space-y-8 text-xl font-bold w-full max-w-md">
            <div className="flex items-center gap-4">
              <span className="w-24">الاسم:</span>
              <span className="flex-1 border-b-2 border-dotted border-slate-500"></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24">التوقيع:</span>
              <span className="flex-1 border-b-2 border-dotted border-slate-500"></span>
            </div>
          </div>

          {/* Watermark Logo Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none grayscale">
            <div className="text-9xl font-black text-slate-900 text-center flex flex-col items-center">
              <span>Doctor Nafsy</span>
              <span>Online</span>
            </div>
          </div>
          
          {/* Accounting Stamp */}
          <div className="absolute bottom-32 left-32 flex items-center justify-center pointer-events-none opacity-80">
            <div className="border-4 border-indigo-600 text-indigo-600 rounded-full w-48 h-48 flex flex-col items-center justify-center text-center p-2 transform -rotate-12">
              <span className="text-sm font-bold uppercase tracking-widest mb-1">Doctor Nafsy Online</span>
              <span className="text-xl font-black uppercase">Accounting</span>
              <span className="text-xl font-black uppercase mb-1">Approved</span>
              <span className="text-xs font-bold mt-2">EST. 2026</span>
              <span className="text-3xl font-black mt-2 font-serif text-indigo-800" style={{fontFamily: "'Dancing Script', cursive"}}>Yasmina</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
