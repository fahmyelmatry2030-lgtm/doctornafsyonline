"use client";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="p-8 m-8 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm text-center" dir="rtl">
      <h2 className="text-2xl font-black text-rose-600 mb-4">حدث خطأ في صفحة الإدارة</h2>
      <div className="bg-white p-4 rounded-xl text-left border border-rose-100 overflow-auto mb-6" dir="ltr">
        <code className="text-sm text-rose-800 font-mono break-words whitespace-pre-wrap">
          {error.message || "خطأ غير معروف"}
        </code>
      </div>
      <p className="text-slate-600 mb-6 font-medium">يرجى تصوير هذا الخطأ وإرساله للدعم الفني ليتم حله فوراً.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
      >
        حاول مجدداً (تحديث)
      </button>
    </div>
  );
}
