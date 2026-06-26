"use client";

import { useState, useEffect } from "react";
import { DollarSign, Gift, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface Bonus {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

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

interface SalaryData {
  current: {
    month: number;
    year: number;
    baseSalary: number;
    totalBonuses: number;
    totalDeductions: number;
    netSalary: number;
  };
  history: MonthlySalaryRecord[];
}

export default function MySalaryPage() {
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/my-salary")
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "حدث خطأ غير معروف");
        }
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل البيانات...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-2">
        <AlertCircle />
        <span>{error || "حدث خطأ"}</span>
      </div>
    );
  }

  const { current, history } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-[#2B3674]">مرتبي</h1>
        <p className="text-[#A3AED0] mt-2">
          تفاصيل راتبك الثابت والمكافآت (العمولات) للشهر الحالي
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">الراتب الثابت</p>
              <p className="text-2xl font-black text-slate-900">{current.baseSalary} ج.م</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gift size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">إجمالي الحوافز/العمولات</p>
              <p className="text-2xl font-black text-emerald-600">+{current.totalBonuses} ج.م</p>
            </div>
          </div>
        </div>

        <div className="bg-[#4318FF] rounded-[24px] p-6 shadow-md text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-100">صافي المستحق (شهر {current.month})</p>
              <p className="text-3xl font-black">{current.netSalary} ج.م</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 mt-8">
        <h2 className="text-lg font-black text-[#2B3674] mb-6 flex items-center gap-2">
          <Calendar className="text-indigo-600" /> سجل الرواتب السابق
        </h2>
        
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
                      {record.status === "PAID" ? "تم التحويل" : record.status === "ACKNOWLEDGED" ? "تم استلام الراتب" : "معلق"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="text-slate-500">الأساسي: <strong className="text-slate-700">{record.baseSalary} ج.م</strong></span>
                    <span className="text-slate-500">إضافي: <strong className="text-emerald-600">+{record.totalBonuses} ج.م</strong></span>
                    <span className="text-slate-500">خصم: <strong className="text-rose-600">-{record.totalDeductions} ج.م</strong></span>
                    <span className="font-bold">الصافي: <strong className="text-indigo-700">{record.netSalary} ج.م</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  {record.transferScreenshot ? (
                    <a href={record.transferScreenshot} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-center transition">
                      عرض إيصال التحويل
                    </a>
                  ) : (
                    <div className="text-sm text-center text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">لم يتم إرفاق إيصال</div>
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
