"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

type AppointmentActionsProps = {
  appointmentId: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
};

export default function AppointmentActions({ appointmentId, status }: AppointmentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: "CONFIRMED" | "CANCELLED") {
    if (newStatus === "CANCELLED" && !confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("فشل تحديث حالة الموعد");
      }
    } catch {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  }

  if (status === "COMPLETED" || status === "CANCELLED" || status === "IN_PROGRESS") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {status === "PENDING" && (
        <button
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading}
          className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          قبول
        </button>
      )}
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading}
        className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
        إلغاء
      </button>
    </div>
  );
}
