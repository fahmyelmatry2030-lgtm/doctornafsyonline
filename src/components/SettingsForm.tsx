"use client";

import { useState } from "react";
import { Lock, Bell, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type SettingsFormProps = {
  updatePasswordAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

export default function SettingsForm({ updatePasswordAction }: SettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف");
      setPasswordLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);

      const res = await updatePasswordAction(formData);
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordError(res.error || "فشل تحديث كلمة المرور");
      }
    } catch {
      setPasswordError("حدث خطأ غير متوقع");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handlePrefsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPrefsLoading(true);
    setPrefsSuccess(false);

    // Mock API call to save preferences
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setPrefsLoading(false);
    setPrefsSuccess(true);
    setTimeout(() => setPrefsSuccess(false), 3000);
  }

  return (
    <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8 space-y-8">
      
      {/* Security Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" /> الأمان وتسجيل الدخول
        </h2>
        
        {passwordSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>تم تغيير كلمة المرور بنجاح!</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">كلمة المرور الحالية</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 outline-none transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            تحديث كلمة المرور
          </button>
        </form>
      </section>

      <hr className="border-slate-100" />

      {/* Notifications Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" /> الإشعارات والتنبيهات
        </h2>

        {prefsSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-semibold w-fit">
            <CheckCircle className="w-4 h-4" />
            <span>تم حفظ التفضيلات بنجاح</span>
          </div>
        )}

        <form onSubmit={handlePrefsSubmit} className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
                className="w-5 h-5 rounded text-[#6366F1] border-slate-300 focus:ring-[#6366F1]/20"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إشعارات البريد الإلكتروني للمواعيد الجديدة</p>
                <p className="text-xs text-slate-500">احصل على تنبيه فوري عند قيام مريض بحجز جلسة جديدة.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={messageNotif}
                onChange={(e) => setMessageNotif(e.target.checked)}
                className="w-5 h-5 rounded text-[#6366F1] border-slate-300 focus:ring-[#6366F1]/20"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إشعارات الرسائل</p>
                <p className="text-xs text-slate-500">احصل على تنبيه عند تلقي رسالة جديدة من مريض.</p>
              </div>
            </label>
          </div>
          <button
            type="submit"
            disabled={prefsLoading}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {prefsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            حفظ التفضيلات
          </button>
        </form>
      </section>

    </div>
  );
}
