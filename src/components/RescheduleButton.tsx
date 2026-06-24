"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

export default function RescheduleButton({ appointmentId }: { appointmentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    if (!newDate) return alert("يرجى اختيار تاريخ جديد");
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDate }),
      });
      if (res.ok) {
        alert("تم إرسال طلب إعادة الجدولة بنجاح");
        setIsOpen(false);
        window.location.reload();
      } else {
        alert("فشل في إعادة الجدولة");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="font-semibold text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
      >
        <Calendar className="w-4 h-4" /> تعديل الموعد
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in-up">
            <h3 className="text-lg font-black text-slate-900 mb-4">تعديل موعد الجلسة</h3>
            <p className="text-sm text-slate-500 mb-4">اختر التاريخ والوقت الجديد لاقتراحه على الأخصائي:</p>
            <input 
              type="datetime-local" 
              className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-900 mb-4"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleReschedule} 
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : "تأكيد الموعد"}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
