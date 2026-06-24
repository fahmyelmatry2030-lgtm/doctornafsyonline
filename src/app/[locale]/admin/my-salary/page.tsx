"use client";

import { useState, useEffect } from "react";
import { DollarSign, Gift, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface Bonus {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface SalaryData {
  baseSalary: number;
  employeeBonuses: Bonus[];
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
          setData(result.data);
        } else {
          setError(result.error);
        }
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

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

  const totalBonuses = data.employeeBonuses.reduce((sum, b) => sum + b.amount, 0);
  const totalSalary = data.baseSalary + totalBonuses;

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
              <p className="text-2xl font-black text-slate-900">{data.baseSalary} ج.م</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Gift size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">مكافآت الشهر</p>
              <p className="text-2xl font-black text-slate-900">{totalBonuses} ج.م</p>
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
              <p className="text-sm font-bold text-indigo-100">الإجمالي المستحق</p>
              <p className="text-3xl font-black">{totalSalary} ج.م</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-black text-[#2B3674] mb-4 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" /> تفاصيل المكافآت والخصومات
        </h2>
        
        {data.employeeBonuses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold">
            لا توجد حركات مالية مسجلة هذا الشهر
          </div>
        ) : (
          <div className="space-y-3">
            {data.employeeBonuses.map(bonus => (
              <div key={bonus.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">{bonus.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(bonus.createdAt).toLocaleString("ar-EG")}</p>
                </div>
                <div className={`font-black text-lg ${bonus.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {bonus.amount >= 0 ? "+" : ""}{bonus.amount} ج.م
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
