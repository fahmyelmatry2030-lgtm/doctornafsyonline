"use client";

import { useState } from "react";
import { Search, Edit2, DollarSign, Calendar, Users, Briefcase, Check } from "lucide-react";
import { updateTherapistSalary } from "@/app/[locale]/admin/salaries/actions";

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
    paymentMethod: string;
    paymentDetails: string;
  } | null;
  employeeBonuses: {
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
  }[];
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
  const [paymentMethod, setPaymentMethod] = useState("VODAFONE_CASH");
  const [paymentDetails, setPaymentDetails] = useState("");

  // Success indicator for inline actions
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

  // Bonus Modal State
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");

  const addBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist || !bonusAmount) return;
    
    try {
      setUpdating(true);
      const res = await fetch("/api/admin/employee-salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_BONUS",
          userId: selectedTherapist.id,
          amount: parseInt(bonusAmount, 10),
          reason: bonusReason,
        }),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        alert("فشل إضافة الساعة الإضافية / المالية");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setUpdating(false);
    }
  };

  const deleteBonus = async (bonusId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه العملية؟")) return;
    try {
      setUpdating(true);
      const res = await fetch("/api/admin/employee-salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_BONUS",
          bonusId,
        }),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        alert("فشل الحذف");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setUpdating(false);
    }
  };

  // Filter therapists
  const filtered = therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate calculated payout for a therapist
  const calculatePayout = (t: TherapistForSalary) => {
    const profile = t.therapistProfile;
    const base = profile ? profile.salary : 0;
    const bonuses = t.employeeBonuses?.reduce((sum, b) => sum + b.amount, 0) || 0;
    return base + bonuses;
  };

  // Stats
  const totalPayroll = therapists.reduce((sum, t) => sum + calculatePayout(t), 0);
  const totalCompletedSessions = therapists.reduce((sum, t) => sum + t.completedSessionsCount, 0);

  const handleEditClick = (t: TherapistForSalary) => {
    setSelectedTherapist(t);
    setSalaryType(t.therapistProfile?.salaryType || "FIXED");
    setSalaryValue(t.therapistProfile?.salary || 0);
    setPaymentMethod(t.therapistProfile?.paymentMethod || "VODAFONE_CASH");
    setPaymentDetails(t.therapistProfile?.paymentDetails || "");
    setErrorMsg(null);
    setShowEditModal(true);
  };

  const handleSaveSalary = async () => {
    if (!selectedTherapist) return;
    try {
      setUpdating(true);
      setErrorMsg(null);

      const res = await updateTherapistSalary(
        selectedTherapist.id,
        salaryType,
        Number(salaryValue),
        paymentMethod,
        paymentDetails
      );
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
                  ? {
                      ...t.therapistProfile,
                      salaryType,
                      salary: Number(salaryValue),
                      paymentMethod,
                      paymentDetails,
                    }
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">إجمالي رواتب الأخصائيين</p>
              <p className="text-2xl font-black text-[#2B3674]">
                {totalPayroll.toLocaleString("ar-EG")} <span className="text-xs font-bold text-slate-400">ج.م</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#A3AED0] mb-1">عدد الأخصائيين</p>
              <p className="text-2xl font-black text-[#2B3674]">{therapists.length} أخصائيين</p>
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
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-[#A3AED0] uppercase tracking-wide text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">الأخصائي</th>
                <th className="px-6 py-4 font-bold">نظام العمل</th>
                <th className="px-6 py-4 font-bold">المرتب الشهري</th>
                <th className="px-6 py-4 font-bold">جلسات هذا الشهر</th>
                <th className="px-6 py-4 font-bold">إضافي/خصم</th>
                <th className="px-6 py-4 font-bold">إجمالي المستحقات</th>
                <th className="px-6 py-4 font-bold">طريقة الدفع</th>
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
                          <img src={encodeURI(decodeURI(t.avatar))} alt={t.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
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
                    <td className="px-6 py-4">
                      {profile?.salaryType === "FIXED" ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                          مرتب ثابت
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                          عمولات
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {profile?.salary || 0} ج.م
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {t.completedSessionsCount} جلسات مكتملة
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${t.employeeBonuses.reduce((acc, b) => acc + b.amount, 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.employeeBonuses.reduce((acc, b) => acc + b.amount, 0) >= 0 ? '+' : ''}{t.employeeBonuses.reduce((acc, b) => acc + b.amount, 0)} ج.م
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-black text-base">
                      {payout.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="px-6 py-4">
                      {profile?.paymentMethod ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            profile.paymentMethod === "VODAFONE_CASH" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            profile.paymentMethod === "INSTAPAY" ? "bg-cyan-50 text-cyan-700 border border-cyan-100" :
                            profile.paymentMethod === "BANK_TRANSFER" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-slate-50 text-slate-700 border border-slate-100"
                          } border`}>
                            {profile.paymentMethod === "VODAFONE_CASH" ? "فودافون كاش" :
                             profile.paymentMethod === "INSTAPAY" ? "إنستاباي" :
                             profile.paymentMethod === "BANK_TRANSFER" ? "تحويل بنكي" : "أخرى"}
                          </span>
                          {profile.paymentDetails && (
                            <p className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 select-all block w-max">
                              {profile.paymentDetails}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
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
                        <div className="flex flex-col gap-2 w-max mx-auto">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4318FF] font-bold rounded-xl transition text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> تعديل الراتب
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTherapist(t);
                              setBonusReason("ساعة إضافية");
                              setShowBonusModal(true);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl transition text-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> مالية/إضافي
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden divide-y divide-slate-50">
          {filtered.map((t) => {
            const payout = calculatePayout(t);
            const isPaid = paidStatus[t.id] || false;
            const profile = t.therapistProfile;

            return (
              <div key={t.id} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={encodeURI(decodeURI(t.avatar))} alt={t.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#2B3674] text-sm">{t.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{t.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => !isReadOnly && handleMarkAsPaid(t.id)}
                    disabled={isReadOnly}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isPaid
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    } transition`}
                  >
                    {isPaid ? <><Check className="w-3 h-3" /> تم الدفع</> : "قيد الانتظار"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">المرتب الشهري</p>
                    <p className="font-bold text-slate-900 text-sm">{profile?.salary || 0} ج.م</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">إجمالي المستحقات</p>
                    <p className="font-black text-emerald-600 text-sm">{payout.toLocaleString("ar-EG")} ج.م</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">جلسات الشهر</p>
                    <p className="font-semibold text-slate-600 text-xs">{t.completedSessionsCount} جلسات</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">الدفع</p>
                    {profile?.paymentMethod ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        profile.paymentMethod === "VODAFONE_CASH" ? "bg-rose-50 text-rose-700" :
                        profile.paymentMethod === "INSTAPAY" ? "bg-cyan-50 text-cyan-700" :
                        profile.paymentMethod === "BANK_TRANSFER" ? "bg-blue-50 text-blue-700" :
                        "bg-slate-200 text-slate-700"
                      }`}>
                        {profile.paymentMethod === "VODAFONE_CASH" ? "فودافون كاش" :
                         profile.paymentMethod === "INSTAPAY" ? "إنستاباي" :
                         profile.paymentMethod === "BANK_TRANSFER" ? "بنكي" : "أخرى"}
                      </span>
                    ) : <span className="text-[10px] text-slate-400">—</span>}
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="flex items-center justify-center w-full gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4318FF] font-bold rounded-xl transition text-xs border border-indigo-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> تعديل الراتب
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTherapist(t);
                        setBonusReason("ساعة إضافية");
                        setShowBonusModal(true);
                      }}
                      className="flex items-center justify-center w-full gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl transition text-xs border border-emerald-100"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> إضافة ساعة/مالية
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Salary Modal */}
      {showEditModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#2B3674]">تعديل بيانات الراتب</h3>
              <p className="text-xs text-slate-400 mt-1">تحديث قيمة الراتب للأخصائي: {selectedTherapist.name}</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">قيمة المرتب الشهري (ج.م)</label>
                <input
                  type="number"
                  value={salaryValue}
                  onChange={(e) => setSalaryValue(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">طريقة الدفع المفضلة</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                >
                  <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                  <option value="INSTAPAY">إنستاباي (InstaPay)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي (Bank Transfer)</option>
                  <option value="OTHER">أخرى (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">تفاصيل الدفع (رقم الهاتف أو الحساب)</label>
                <input
                  type="text"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="مثال: 01012345678 أو حساب بنكي رقم..."
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

      {/* Bonus Modal */}
      {showBonusModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">إضافة ساعة إضافية / خصم</h3>
              <p className="text-sm text-slate-500 mt-1">للأخصائي: {selectedTherapist.name}</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <form onSubmit={addBonus} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-sm font-bold mb-1">المبلغ (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    placeholder="مثال: 50"
                  />
                  <p className="text-xs text-slate-500 mt-1">يمكنك إدخال قيمة سالبة (-) للخصومات</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">السبب</label>
                  <input
                    type="text"
                    required
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    placeholder="مثال: ساعة إضافية"
                  />
                </div>
                <button
                  disabled={updating}
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700"
                >
                  إضافة
                </button>
              </form>

              <div>
                <h4 className="font-bold mb-3 border-b pb-2">سجل الساعات الإضافية هذا الشهر</h4>
                {selectedTherapist.employeeBonuses.length === 0 ? (
                  <p className="text-slate-500 text-sm">لا توجد عمليات مالية مسجلة</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTherapist.employeeBonuses.map(bonus => (
                      <div key={bonus.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div>
                          <p className="font-bold text-sm">{bonus.reason}</p>
                          <p className="text-xs text-slate-400">{new Date(bonus.createdAt).toLocaleString("ar-EG")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${bonus.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {bonus.amount >= 0 ? "+" : ""}{bonus.amount} ج.م
                          </span>
                          <button
                            onClick={() => deleteBonus(bonus.id)}
                            disabled={updating}
                            className="text-red-500 hover:text-red-700 p-1 font-bold text-xs bg-red-50 rounded px-2"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <div className="p-4 border-t bg-slate-50 text-left">
              <button
                onClick={() => setShowBonusModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
