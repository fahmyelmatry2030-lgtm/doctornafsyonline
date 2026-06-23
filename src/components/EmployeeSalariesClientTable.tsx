"use client";

import { useState } from "react";
import { User, Plus, Trash2, TrendingUp, DollarSign } from "lucide-react";

interface EmployeeBonus {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  baseSalary: number;
  employeeBonuses: EmployeeBonus[];
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

  const totalSalaries = employees.reduce((acc, e) => acc + e.baseSalary, 0);
  const totalBonuses = employees.reduce((acc, e) => acc + e.employeeBonuses.reduce((sum, b) => sum + b.amount, 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wide text-xs">
              <tr>
                <th className="px-6 py-4">اسم الموظف</th>
                <th className="px-6 py-4">الوظيفة</th>
                <th className="px-6 py-4">الراتب الأساسي</th>
                <th className="px-6 py-4">عمولات الشهر</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => {
                const empBonusesTotal = employee.employeeBonuses.reduce((acc, b) => acc + b.amount, 0);
                
                return (
                  <tr key={employee.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-500">{employee.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
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
                      <span className="font-bold text-orange-600">{empBonusesTotal} ج.م</span>
                      <p className="text-xs text-slate-500 mt-1">({employee.employeeBonuses.length} عمليات)</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowBonusModal(true);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition inline-flex items-center gap-1"
                      >
                        <Plus size={14} /> إضافة عمولة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    </div>
  );
}
