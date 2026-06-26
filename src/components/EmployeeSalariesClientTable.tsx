"use client";

import { useState } from "react";
import { User, Plus, Trash2, TrendingUp, DollarSign } from "lucide-react";

interface EmployeeBonus {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface MonthlySalaryRecord {
  id: string;
  month: number;
  year: number;
  status: "PENDING" | "PAID" | "ACKNOWLEDGED";
  transferScreenshot?: string | null;
  receiptDocument?: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  baseSalary: number;
  employeeBonuses: EmployeeBonus[];
  monthlySalaryRecords: MonthlySalaryRecord[];
}

interface Props {
  initialEmployees: Employee[];
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    "ADMIN": "مدير النظام",
    "ADMIN_HR": "الموارد البشرية",
    "ADMIN_ACCOUNTING": "الحسابات",
    "ADMIN_VIEWER": "مراقب إدارة",
    "SHIFT_LEADER": "قائد شيفت",
    "ADMIN_CUSTOMER_SERVICE": "خدمة العملاء",
  };
  return map[role] || role;
}

export function EmployeeSalariesClientTable({ initialEmployees }: Props) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [editingBaseSalary, setEditingBaseSalary] = useState<string | null>(null);
  const [baseSalaryInput, setBaseSalaryInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Bonus Modal State
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const updateBaseSalary = async (employeeId: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/employee-salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BASE_SALARY",
          userId: employeeId,
          amount: parseInt(baseSalaryInput, 10),
        }),
      });
      if (res.ok) {
        setEmployees(employees.map(e => e.id === employeeId ? { ...e, baseSalary: parseInt(baseSalaryInput, 10) } : e));
        setEditingBaseSalary(null);
      } else {
        alert("فشل تحديث الراتب الأساسي");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const addBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !bonusAmount) return;
    
    try {
      setLoading(true);
      const res = await fetch("/api/admin/employee-salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_BONUS",
          userId: selectedEmployee.id,
          amount: parseInt(bonusAmount, 10),
          reason: bonusReason,
        }),
      });
      
      if (res.ok) {
        // Refresh data
        window.location.reload();
      } else {
        alert("فشل إضافة المكافأة");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const deleteBonus = async (bonusId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المكافأة؟")) return;
    try {
      setLoading(true);
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
        alert("فشل حذف المكافأة");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const finalizeSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("userId", selectedEmployee.id);
      
      const now = new Date();
      formData.append("month", (now.getMonth() + 1).toString());
      formData.append("year", now.getFullYear().toString());
      
      const empBonusesTotal = selectedEmployee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0);
      let totalBonuses = 0;
      let totalDeductions = 0;
      selectedEmployee.employeeBonuses.forEach(b => {
        if (b.amount >= 0) totalBonuses += b.amount;
        else totalDeductions += Math.abs(b.amount);
      });

      formData.append("baseSalary", selectedEmployee.baseSalary.toString());
      formData.append("totalBonuses", totalBonuses.toString());
      formData.append("totalDeductions", totalDeductions.toString());
      formData.append("netSalary", (selectedEmployee.baseSalary + empBonusesTotal).toString());

      if (paymentScreenshot) {
        formData.append("screenshot", paymentScreenshot);
      }

      const res = await fetch("/api/admin/employee-salaries/finalize", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "فشل الدفع");
      }
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const totalSalaries = employees.reduce((acc, e) => acc + e.baseSalary, 0);
  const totalBonuses = employees.reduce((acc, e) => acc + e.employeeBonuses.reduce((sum, b) => sum + b.amount, 0), 0);
  const grandTotal = totalSalaries + totalBonuses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي فريق العمل</p>
            <p className="text-2xl font-black text-slate-900">{employees.length} موظف</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي الرواتب الثابتة (هذا الشهر)</p>
            <p className="text-2xl font-black text-slate-900">{totalSalaries} ج.م</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي العمولات (هذا الشهر)</p>
            <p className="text-2xl font-black text-slate-900">{totalBonuses} ج.م</p>
          </div>
        </div>
        <div className="bg-indigo-600 rounded-[24px] p-6 border border-indigo-500 shadow-md flex items-center gap-4 text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-100 mb-1">الإجمالي العام المستحق</p>
            <p className="text-2xl font-black">{grandTotal} ج.م</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide text-xs">
              <tr>
                <th className="px-6 py-4">اسم الموظف</th>
                <th className="px-6 py-4">الوظيفة</th>
                <th className="px-6 py-4">الراتب الأساسي</th>
                <th className="px-6 py-4">العمولات/الخصومات</th>
                <th className="px-6 py-4">الإجمالي النهائي</th>
                <th className="px-6 py-4">حالة الدفع</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => {
                const empBonusesTotal = employee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0);
                const currentMonthRecord = employee.monthlySalaryRecords?.[0];
                const isPaid = currentMonthRecord?.status === "PAID" || currentMonthRecord?.status === "ACKNOWLEDGED";
                
                return (
                  <tr key={employee.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-500">{employee.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 inline-block">
                        {getRoleLabel(employee.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {editingBaseSalary === employee.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={baseSalaryInput}
                            onChange={(e) => setBaseSalaryInput(e.target.value)}
                            className="w-24 border rounded p-1 text-sm"
                          />
                          <button
                            onClick={() => updateBaseSalary(employee.id)}
                            disabled={loading}
                            className="bg-emerald-600 text-white px-2 py-1 rounded text-xs"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingBaseSalary(null)}
                            className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{employee.baseSalary} ج.م</span>
                          <button
                            onClick={() => {
                              setEditingBaseSalary(employee.id);
                              setBaseSalaryInput(employee.baseSalary.toString());
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-xs underline"
                          >
                            تعديل
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${empBonusesTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {empBonusesTotal >= 0 ? '+' : ''}{empBonusesTotal} ج.م
                      </span>
                      <p className="text-xs text-slate-500 mt-1">({employee.employeeBonuses.length} عمليات)</p>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-700 text-base">
                      {employee.baseSalary + empBonusesTotal} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {isPaid ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded w-max">تم الدفع</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded w-max">معلق</span>
                        )}
                        {currentMonthRecord?.transferScreenshot && (
                          <a href={currentMonthRecord.transferScreenshot} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1">صورة التحويل</a>
                        )}
                        {currentMonthRecord?.receiptDocument && (
                          <a href={currentMonthRecord.receiptDocument} target="_blank" rel="noreferrer" className="text-[10px] text-purple-600 hover:underline">إقرار الموظف</a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowBonusModal(true);
                          }}
                          className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1 border border-indigo-100"
                        >
                          <Plus size={14} /> إضافة مالية
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowPaymentModal(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 border ${
                            isPaid 
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                          }`}
                          disabled={isPaid}
                        >
                          تسليم الراتب
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {employees.map((employee) => {
            const empBonusesTotal = employee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0);
            const currentMonthRecord = employee.monthlySalaryRecords?.[0];
            const isPaid = currentMonthRecord?.status === "PAID" || currentMonthRecord?.status === "ACKNOWLEDGED";

            return (
              <div key={employee.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{employee.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{employee.email}</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100 text-center">
                    {getRoleLabel(employee.role)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="col-span-2 flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">
                    <p className="text-xs text-indigo-900 font-bold">الإجمالي النهائي للقبض</p>
                    <p className="font-black text-indigo-700 text-base">{employee.baseSalary + empBonusesTotal} ج.م</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-1">الراتب الأساسي</p>
                    {editingBaseSalary === employee.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            value={baseSalaryInput}
                            onChange={(e) => setBaseSalaryInput(e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-sm"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => updateBaseSalary(employee.id)} disabled={loading} className="flex-1 bg-emerald-600 text-white px-2 py-1.5 rounded-md text-xs font-bold">حفظ</button>
                            <button onClick={() => setEditingBaseSalary(null)} className="flex-1 bg-slate-200 text-slate-700 px-2 py-1.5 rounded-md text-xs font-bold">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{employee.baseSalary} ج.م</span>
                          <button
                            onClick={() => {
                              setEditingBaseSalary(employee.id);
                              setBaseSalaryInput(employee.baseSalary.toString());
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-[11px] underline font-medium"
                          >
                            تعديل
                          </button>
                        </div>
                      )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold mb-1">المكافآت والخصومات</p>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${empBonusesTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {empBonusesTotal >= 0 ? '+' : ''}{empBonusesTotal} ج.م
                      </span>
                      <span className="text-[10px] text-slate-400">({employee.employeeBonuses.length} عمليات)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowBonusModal(true);
                    }}
                    className="w-full bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1 border border-indigo-100"
                  >
                    <Plus size={14} /> مالية
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowPaymentModal(true);
                    }}
                    disabled={isPaid}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1 border ${
                      isPaid 
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                    }`}
                  >
                    {isPaid ? "مدفوع" : "تسليم الراتب"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBonusModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">إضافة عمولة / خصم</h3>
              <p className="text-sm text-slate-500 mt-1">للموظف: {selectedEmployee.name}</p>
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
                    placeholder="مثال: 5"
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
                    placeholder="مثال: عمولة حجز مريض"
                  />
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
                >
                  إضافة
                </button>
              </form>

              <div>
                <h4 className="font-bold mb-3 border-b pb-2">سجل العمولات هذا الشهر</h4>
                {selectedEmployee.employeeBonuses.length === 0 ? (
                  <p className="text-slate-500 text-sm">لا توجد عمولات</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEmployee.employeeBonuses.map(bonus => (
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
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
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

      {/* Payment Modal */}
      {showPaymentModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">تسليم الراتب</h3>
              <p className="text-sm text-slate-500 mt-1">للموظف: {selectedEmployee.name}</p>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={finalizeSalary} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                    <span>الراتب الأساسي:</span>
                    <span>{selectedEmployee.baseSalary} ج.م</span>
                  </p>
                  <p className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                    <span>المكافآت والخصومات:</span>
                    <span>{selectedEmployee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0)} ج.م</span>
                  </p>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <p className="text-lg font-black text-indigo-700 flex justify-between">
                    <span>الإجمالي المستحق:</span>
                    <span>{selectedEmployee.baseSalary + selectedEmployee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0)} ج.م</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">صورة إيصال التحويل (اختياري)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPaymentScreenshot(e.target.files[0]);
                      }
                    }}
                    className="w-full border p-2 rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">سيتمكن الموظف من رؤية الإيصال في صفحته الشخصية.</p>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                  تأكيد الدفع
                </button>
              </form>
            </div>
            <div className="p-4 border-t bg-slate-50 text-left">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentScreenshot(null);
                }}
                className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
