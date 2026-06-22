"use client";

import { useState, useEffect } from "react";
import { Shield, Save, Loader2, CheckCircle, RotateCcw } from "lucide-react";

// All available admin pages with Arabic labels
const ALL_PAGES = [
  { path: "/admin/dashboard", label: "الرئيسية 🏠", alwaysOn: true },
  { path: "/admin/operations", label: "إدارة الجلسات والعمليات 📅" },
  { path: "/admin/therapists", label: "توثيق واعتماد الأخصائيين ✅" },
  { path: "/admin/patients", label: "إدارة المرضى 👥" },
  { path: "/admin/reports", label: "اعتماد التحويلات المالية 💰" },
  { path: "/admin/content", label: "المقالات والتقييمات 📝" },
  { path: "/admin/marketing", label: "الدعم، الإشعارات وأكواد الخصم 🎟️" },
  { path: "/admin/support", label: "رسائل الدعم الفني 🎧" },
  { path: "/admin/certificates", label: "شهادات الكورسات والتدريب 🎓" },
  { path: "/admin/customer-service", label: "لوحة تحكم خدمة العملاء 🎯" },
  { path: "/admin/settings", label: "إعدادات المنصة ⚙️" },
];

const ROLES = [
  {
    key: "ADMIN_HR",
    label: "مدير موارد بشرية",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-500",
    desc: "متخصص في إدارة الأخصائيين والمرضى",
  },
  {
    key: "ADMIN_ACCOUNTING",
    label: "مدير حسابات",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    desc: "متخصص في متابعة التحويلات المالية والأرباح",
  },
  {
    key: "ADMIN_VIEWER",
    label: "مراقب — عرض فقط 🔍",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    desc: "يستطيع مشاهدة الصفحات فقط دون تعديل",
  },
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN_HR: ["/admin/dashboard", "/admin/operations", "/admin/therapists", "/admin/patients", "/admin/customer-service"],
  ADMIN_ACCOUNTING: ["/admin/dashboard", "/admin/operations", "/admin/reports"],
  ADMIN_VIEWER: [
    "/admin/dashboard", "/admin/operations", "/admin/therapists", "/admin/patients",
    "/admin/reports", "/admin/content", "/admin/marketing", "/admin/support",
    "/admin/certificates", "/admin/customer-service", "/admin/settings",
  ],
};

export function RolePermissionsManager() {
  const [permissions, setPermissions] = useState<Record<string, string[]>>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/role-permissions")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPermissions(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePage = (role: string, pagePath: string) => {
    setPermissions((prev) => {
      const current = prev[role] || [];
      const has = current.includes(pagePath);
      return {
        ...prev,
        [role]: has ? current.filter((p) => p !== pagePath) : [...current, pagePath],
      };
    });
  };

  const resetRole = (role: string) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: [...DEFAULT_PERMISSIONS[role]],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/role-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || "حدث خطأ أثناء الحفظ");
      }
    } catch {
      alert("فشل الاتصال بالسيرفر");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#2B3674] flex items-center gap-3">
              <Shield className="w-7 h-7 text-indigo-500" />
              إدارة صلاحيات الأدوار
            </h2>
            <p className="text-slate-500 mt-1 font-medium">
              حدد أي الصفحات يستطيع كل دور من الوصول إليها في لوحة التحكم.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-7 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 min-w-[160px] justify-center"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saved ? "تم الحفظ ✓" : saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>

        {/* Info Alert */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-8 text-amber-800 text-sm font-medium">
          ⚠️ <strong>ملاحظة:</strong> صفحة الرئيسية مُفعَّلة دائماً لجميع الأدوار ولا يمكن إلغاؤها. التغييرات تسري على المديرين الجدد والحاليين فور الحفظ وتسجيل الدخول من جديد.
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ROLES.map((role) => {
            const rolePerms = permissions[role.key] || [];
            const enabledCount = rolePerms.filter((p) => p !== "/admin/dashboard").length;
            const totalOptional = ALL_PAGES.filter((p) => !p.alwaysOn).length;

            return (
              <div key={role.key} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Role Header */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${role.color} mb-2`}>
                      <div className={`w-2 h-2 rounded-full ${role.dotColor}`}></div>
                      {role.label}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                    <p className="text-[11px] text-indigo-600 font-bold mt-2">
                      {enabledCount}/{totalOptional} صفحة مُفعَّلة
                    </p>
                  </div>
                  <button
                    onClick={() => resetRole(role.key)}
                    title="إعادة تعيين للافتراضي"
                    className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Pages toggles */}
                <div className="p-4 space-y-2">
                  {ALL_PAGES.map((page) => {
                    const isEnabled = rolePerms.includes(page.path);
                    const isForced = page.alwaysOn;
                    return (
                      <label
                        key={page.path}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isEnabled ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50 border border-transparent"
                        } ${isForced ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-100"}`}
                      >
                        <span className={`text-xs font-semibold ${isEnabled ? "text-indigo-800" : "text-slate-500"}`}>
                          {page.label}
                        </span>
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isEnabled}
                            disabled={isForced}
                            onChange={() => !isForced && togglePage(role.key, page.path)}
                          />
                          <div
                            className={`w-9 h-5 rounded-full transition-colors relative ${
                              isEnabled ? "bg-indigo-500" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[3px] right-[3px] transition-transform duration-200 ${
                                isEnabled ? "-translate-x-4" : "translate-x-0"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
