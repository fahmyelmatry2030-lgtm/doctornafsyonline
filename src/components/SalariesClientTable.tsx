"use client";

import { useState } from "react";
import { Search, Edit2, DollarSign, Calendar, Users, Briefcase, Check } from "lucide-react";
import { updateTherapistSalary } from "@/app/admin/salaries/actions";

type TherapistForSalary = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  completedSessionsCount: number;
  therapistProfile: {
    pricePerSession: number;
    salary: number;
    salaryType: string;
  } | null;
};

type Props = {
  initialTherapists: TherapistForSalary[];
  isReadOnly: boolean;
};

export function SalariesClientTable({ initialTherapists, isReadOnly }: Props) {
  const [therapists, setTherapists] = useState<TherapistForSalary[]>(initialTherapists);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistForSalary | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Modal form states
  const [salaryType, setSalaryType] = useState("FIXED");
  const [salaryValue, setSalaryValue] = useState(0);

  // Success indicator for inline actions
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

  // Filter therapists
  const filtered = therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate calculated payout for a therapist
  const calculatePayout = (t: TherapistForSalary) => {
    const profile = t.therapistProfile;
    if (!profile) return 0;

    if (profile.salaryType === "FIXED") {
      return profile.salary;
    } else if (profile.salaryType === "COMMISSION") {
      // commission is configured as percentage e.g. 50 (%) of the price per session
      const commissionPercent = profile.salary > 0 ? profile.salary : 50; // default 50%
      const totalAmount = t.completedSessionsCount * profile.pricePerSession;
      return Math.round(totalAmount * (commissionPercent / 100));
    } else if (profile.salaryType === "HOURLY") {
      // hourly salary e.g. 150 EGP per session completed
      const hourlyRate = profile.salary > 0 ? profile.salary : profile.pricePerSession;
      return t.completedSessionsCount * hourlyRate;
    }
    return 0;
  };

  // Stats
  const totalPayroll = therapists.reduce((sum, t) => sum + calculatePayout(t), 0);
  const fixedCount = therapists.filter((t) => t.therapistProfile?.salaryType === "FIXED").length;
  const commissionCount = therapists.filter((t) => t.therapistProfile?.salaryType === "COMMISSION").length;
  const totalCompletedSessions = therapists.reduce((sum, t) => sum + t.completedSessionsCount, 0);

  const handleEditClick = (t: TherapistForSalary) => {
    setSelectedTherapist(t);
    setSalaryType(t.therapistProfile?.salaryType || "FIXED");
    setSalaryValue(t.therapistProfile?.salary || 0);
    setErrorMsg(null);
    setShowEditModal(true);
  };

  const handleSaveSalary = async () => {
    if (!selectedTherapist) return;
    try {
      setUpdating(true);
      setErrorMsg(null);

      const res = await updateTherapistSalary(selectedTherapist.id, salaryType, Number(salaryValue));
      if (!res.success) {
        throw new Error(res.error || "فشل تحديث الراتب");
      }

      // Update local state
      setTherapists((prev) =>
        prev.map((t) =>
          t.id === selectedTherapist.id
            ? {
                ...t,
                therapistProfile: t.therapistProfile
                  ? { ...t.therapistProfile, salaryType, salary: Number(salaryValue) }
                  : null,
              }
            : t
        )
      );

      setShowEditModal(false);
      setSelectedTherapist(null);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsPaid = (therapistId: string) => {
    setPaidStatus((prev) => ({
      ...prev,
      [therapistId]: !prev[therapistId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">إجمالي المستحقات (هذا الشهر)</p>
              <p className="text-2xl font-black text-[#2B3674]">
                {totalPayroll.toLocaleString("ar-EG")} <span className="text-xs font-bold text-slate-400">ج.م</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">نظام راتب ثابت</p>
              <p className="text-2xl font-black text-[#2B3674]">{fixedCount} أخصائيين</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">نظام عمولات</p>
              <p className="text-2xl font-black text-[#2B3674]">{commissionCount} أخصائيين</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">إجمالي الجلسات المكتملة</p>
              <p className="text-2xl font-black text-[#2B3674]">{totalCompletedSessions} جلسات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="ابحث عن أخصائي بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          يظهر {filtered.length} من أصل {therapists.length} أخصائيين
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-[#A3AED0] uppercase tracking-wide text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">الأخصائي</th>
                <th className="px-6 py-4 font-bold">نظام الحساب</th>
                <th className="px-6 py-4 font-bold">القيمة المدخلة</th>
                <th className="px-6 py-4 font-bold">جلسات هذا الشهر</th>
                <th className="px-6 py-4 font-bold">المستحقات المقدرة</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                {!isReadOnly && <th className="px-6 py-4 text-center font-bold">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => {
                const payout = calculatePayout(t);
                const isPaid = paidStatus[t.id] || false;
                const profile = t.therapistProfile;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#2B3674]">{t.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {profile?.salaryType === "FIXED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          راتب ثابت
                        </span>
                      ) : profile?.salaryType === "COMMISSION" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          نظام عمولة (%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          بالجلسة (ساعة)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {profile?.salaryType === "COMMISSION"
                        ? `${profile.salary || 50}%`
                        : `${profile?.salary || 0} ج.م`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {t.completedSessionsCount} جلسات مكتملة
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-black text-base">
                      {payout.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => !isReadOnly && handleMarkAsPaid(t.id)}
                        disabled={isReadOnly}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isPaid
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        } transition`}
                      >
                        {isPaid ? (
                          <>
                            <Check className="w-3 h-3" /> تم الدفع
                          </>
                        ) : (
                          "قيد الانتظار"
                        )}
                      </button>
                    </td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4318FF] font-bold rounded-xl transition text-xs mx-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> تعديل الراتب
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      {showEditModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#2B3674]">تعديل نظام الراتب</h3>
              <p className="text-xs text-slate-400 mt-1">تحديث طريقة حساب الراتب للأخصائي: {selectedTherapist.name}</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">نوع الراتب / نظام الاستحقاق</label>
                <select
                  value={salaryType}
                  onChange={(e) => {
                    setSalaryType(e.target.value);
                    if (e.target.value === "COMMISSION") {
                      setSalaryValue(50); // default 50% commission
                    } else {
                      setSalaryValue(0);
                    }
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                >
                  <option value="FIXED">راتب شهري ثابت (Fixed Salary)</option>
                  <option value="COMMISSION">عمولة نسبة مئوية (Commission %)</option>
                  <option value="HOURLY">دفع بالجلسة الواحدة (Hourly/Per-Session)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  {salaryType === "COMMISSION" ? "نسبة العمولة من قيمة الجلسة (%)" : "قيمة الراتب أو قيمة الجلسة (ج.م)"}
                </label>
                <input
                  type="number"
                  value={salaryValue}
                  onChange={(e) => setSalaryValue(Number(e.target.value))}
                  placeholder={salaryType === "COMMISSION" ? "50" : "5000"}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTherapist(null);
                }}
                disabled={updating}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition text-sm font-bold disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSalary}
                disabled={updating}
                className="px-5 py-2.5 bg-[#4318FF] hover:bg-[#2B12D3] text-white rounded-2xl transition text-sm font-bold disabled:opacity-50 shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
              >
                {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
