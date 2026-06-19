"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export default function PayOnlineButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "فشل بدء عملية الدفع الإلكتروني");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع أثناء الاتصال ببوابة الدفع");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-sm hover:shadow disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CreditCard className="w-3.5 h-3.5" />
      )}
      {loading ? "جاري التوجيه..." : "ادفع أونلاين بالفيزا"}
    </button>
  );
}
