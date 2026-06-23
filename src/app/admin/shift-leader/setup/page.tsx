"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function QuickSetupPage() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTestShiftLeader = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessages([]);

      addMessage("🔄 جاري إنشاء قائد شيفت اختبار...");

      const response = await fetch("/api/admin/create-test-shift-leader", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل الإنشاء");
      }

      addMessage("✅ تم إنشاء قائد الشيفت بنجاح!");
      addMessage(`📧 البريد: ${data.user.email}`);
      addMessage(`🔑 كلمة المرور: TestPassword123`);
      addMessage("ادخل بهذه البيانات على صفحة الدخول ثم افتح /admin/shift-leader");
    } catch (err: any) {
      setError(err.message);
      addMessage(`❌ خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDiagnosis = async () => {
    try {
      setLoading(true);
      setMessages([]);
      setError(null);

      addMessage("🔍 جاري فحص النظام...");

      const response = await fetch("/api/admin/shift-leader/diagnose");
      const data = await response.json();

      Object.entries(data.checks || {}).forEach(([key, check]: [string, any]) => {
        const icon = check.status === "success" ? "✅" : "❌";
        addMessage(`${icon} ${key}: ${JSON.stringify(check).substring(0, 60)}...`);
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            🚀 إعداد سريع - قائد الشيفت
          </h1>
          <p className="text-gray-600 mb-6">اختبار سريع للتحقق من النظام والإعدادات</p>

          <div className="space-y-4 mb-8">
            <button
              onClick={handleViewDiagnosis}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : "🔍"}
              فحص النظام والتشخيص
            </button>

            <button
              onClick={handleCreateTestShiftLeader}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : "✅"}
              إنشاء قائد شيفت اختبار
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg flex items-start gap-3 mb-6">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">النتائج:</h3>
              <div className="space-y-2 text-sm font-mono">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-slate-700">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 الخطوات:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>اضغط "فحص النظام" أولاً لمعرفة الأخطاء</li>
              <li>ثم اضغط "إنشاء قائد شيفت" لإنشاء حساب اختبار</li>
              <li>ادخل بالبريد والكلمة المعطاة</li>
              <li>افتح /admin/shift-leader بعد الدخول</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
