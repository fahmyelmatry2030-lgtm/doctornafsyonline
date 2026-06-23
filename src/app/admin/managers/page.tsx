"use client";

import { useState, useEffect } from "react";
import { Plus, User, ShieldCheck, Mail, Calendar, Loader2, Trash2, Eye, EyeOff, Shield } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { RolePermissionsManager } from "./RolePermissionsManager";

type Manager = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isSuspended: boolean;
};

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"managers" | "permissions">("managers");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN_ACCOUNTING");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/managers");
      if (res.ok) {
        const data = await res.json();
        setManagers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("تمت إضافة المدير بنجاح");
        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setRole("ADMIN_ACCOUNTING");
        setIsAdding(false);
        fetchManagers();
      } else {
        setError(data.error || "حدث خطأ أثناء الإضافة");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteManager = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المدير "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/managers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`تم حذف المدير "${name}" بنجاح`);
        fetchManagers();
      } else {
        setError(data.error || "حدث خطأ أثناء حذف المدير");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
  };

  const getRoleLabel = (roleStr: string) => {
    if (roleStr === "ADMIN") return { label: "مدير عام", color: "bg-purple-100 text-purple-700" };
    if (roleStr === "ADMIN_HR") return { label: "مدير موارد بشرية", color: "bg-indigo-100 text-indigo-700" };
    if (roleStr === "ADMIN_ACCOUNTING") return { label: "مدير حسابات", color: "bg-emerald-100 text-emerald-700" };
    if (roleStr === "ADMIN_VIEWER") return { label: "مراقب — عرض فقط 🔍", color: "bg-amber-100 text-amber-700" };
    if (roleStr === "SHIFT_LEADER") return { label: "قائد الشيفت", color: "bg-blue-100 text-blue-700" };
    return { label: roleStr, color: "bg-slate-100 text-slate-700" };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2B3674] mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            إدارة صلاحيات المديرين
          </h1>
          <p className="text-slate-500 font-medium">
            قم بإضافة مديرين للنظام وتحديد الصلاحيات المخصصة لكل منهم
          </p>
        </div>
        {activeTab === "managers" && (
          <button
            onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? "إلغاء الإضافة" : "إضافة مدير جديد"}
        </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1 w-fit">
        <button
          onClick={() => setActiveTab("managers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "managers" ? "bg-[#2B3674] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          قائمة المديرين
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "permissions" ? "bg-[#2B3674] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Shield className="w-4 h-4" />
          تخصيص الصلاحيات
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "permissions" && <RolePermissionsManager />}

      {activeTab === "managers" && (<>

      {/* Add Form Section */}
      {isAdding && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 animate-fade-in">
          <h2 className="text-xl font-bold text-[#2B3674] mb-6 border-b border-slate-100 pb-4">
            إضافة مدير جديد للوحة التحكم
          </h2>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 font-medium border border-green-100">{success}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">الاسم كاملاً</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="مثال: أحمد محمود"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="admin@nafsi.com"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="••••••••"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">الدور والصلاحية</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="ADMIN_HR">مدير موارد بشرية (إدارة الأطباء والمرضى)</option>
                <option value="ADMIN_ACCOUNTING">مدير حسابات (أرباح، فواتير)</option>
                <option value="ADMIN_VIEWER">مراقب — عرض فقط 🔍 (لا يمكنه التعديل)</option>
                <option value="SHIFT_LEADER">قائد الشيفت (Shift Leader)</option>
                <option value="ADMIN">مدير عام (كافة الصلاحيات)</option>
              </select>
            </div>

            <div className="col-span-full pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto flex items-center justify-center gap-2"
              >
                {submitLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                إنشاء الحساب
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Managers List */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-[#2B3674] mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          المديرين المسجلين حالياً
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">لا يوجد مديرين مسجلين حالياً باستثناء حسابك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((manager) => {
              const roleInfo = getRoleLabel(manager.role);
              return (
                <div key={manager.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow bg-slate-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {manager.name.charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{manager.name}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4" /> {manager.email}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      تاريخ الإضافة: {format(new Date(manager.createdAt), "dd MMM yyyy", { locale: arSA })}
                    </span>
                    <button
                      onClick={() => handleDeleteManager(manager.id, manager.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="حذف الحساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>)}
    </div>
  );
}
