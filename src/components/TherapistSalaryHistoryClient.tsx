"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

interface MonthlySalaryRecord {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  netSalary: number;
  status: "PENDING" | "PAID" | "ACKNOWLEDGED";
  transferScreenshot?: string | null;
  receiptDocument?: string | null;
}

interface Props {
  history: MonthlySalaryRecord[];
}

export default function TherapistSalaryHistoryClient({ history }: Props) {
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);

  const handleUploadReceipt = async (recordId: string, file: File) => {
    try {
      setUploadingReceipt(recordId);
      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("receipt", file);

      const res = await fetch("/api/my-salary/upload-receipt", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const result = await res.json();
        alert(result.error || "فشل رفع الإيصال");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setUploadingReceipt(null);
    }
  };

  return (
    <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">سجل المدفوعات والرواتب</h2>
        </div>
      </div>
      
      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-xl border border-slate-100">
            لا توجد سجلات رواتب مدفوعة حتى الآن
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(record => (
              <div key={record.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between md:justify-start md:gap-4">
                    <h3 className="font-black text-lg text-slate-900">شهر {record.month} - {record.year}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      record.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      record.status === "ACKNOWLEDGED" ? "bg-indigo-100 text-indigo-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {record.status === "PAID" ? "تم التحويل (في انتظار إقرارك)" : record.status === "ACKNOWLEDGED" ? "تم استلام الراتب" : "معلق"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="text-slate-500">الأساسي: <strong className="text-slate-700">{record.baseSalary} ج.م</strong></span>
                    <span className="text-slate-500">مكافآت/عمولات: <strong className="text-emerald-600">+{record.totalBonuses} ج.م</strong></span>
                    <span className="text-slate-500">خصم: <strong className="text-rose-600">-{record.totalDeductions} ج.م</strong></span>
                    <span className="font-bold">الصافي المدفوع: <strong className="text-indigo-700">{record.netSalary} ج.م</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  {record.transferScreenshot ? (
                    <a href={record.transferScreenshot} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-center transition">
                      عرض صورة التحويل
                    </a>
                  ) : (
                    <div className="text-sm text-center text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">لم يتم إرفاق صورة تحويل</div>
                  )}

                  {record.status === "PAID" && !record.receiptDocument && (
                    <div className="flex flex-col gap-2">
                      <a 
                        href="/receipt_template.pdf" 
                        download="اقرار_استلام_مستحقات.pdf"
                        target="_blank"
                        className="w-full text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-4 py-2 rounded-xl transition flex items-center justify-center shadow-sm"
                      >
                        تحميل نموذج الإقرار
                      </a>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadReceipt(record.id, e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingReceipt === record.id}
                        />
                        <button 
                          disabled={uploadingReceipt === record.id}
                          className="w-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition flex items-center justify-center disabled:opacity-50 shadow-sm"
                        >
                          {uploadingReceipt === record.id ? "جاري الرفع..." : "إرفاق الإقرار الموقع"}
                        </button>
                      </div>
                    </div>
                  )}

                  {record.receiptDocument && (
                    <a href={record.receiptDocument} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl text-center">
                      عرض إقراري
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
