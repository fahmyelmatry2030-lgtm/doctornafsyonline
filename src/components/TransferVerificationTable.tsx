"use client";

import { useState, useTransition } from "react";
import { Check, X, FileImage, Loader2, AlertCircle, Calendar, User } from "lucide-react";
import { updateAppointmentStatus, rejectAppointmentPayment } from "@/app/admin/operations/actions";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

type TransferAppointment = {
  id: string;
  price: number;
  scheduledAt: string | Date;
  paymentScreenshot: string | null;
  createdAt: string | Date;
  patient: { name: string; email: string };
  therapist: { name: string };
};

export default function TransferVerificationTable({
  initialTransfers,
  isReadOnly = false,
}: {
  initialTransfers: TransferAppointment[];
  isReadOnly?: boolean;
}) {
  const [transfers, setTransfers] = useState<TransferAppointment[]>(initialTransfers);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = (id: string) => {
    if (isReadOnly) return;
    if (!confirm("هل أنت متأكد من اعتماد هذا التحويل وتأكيد الجلسة؟")) return;

    setMessage(null);
    startTransition(async () => {
      const res = await updateAppointmentStatus(id, "CONFIRMED");
      if (res.success) {
        setTransfers((prev) => prev.filter((t) => t.id !== id));
        setMessage({ type: "success", text: "تم اعتماد التحويل وتأكيد الجلسة بنجاح!" });
      } else {
        setMessage({ type: "error", text: res.error || "فشل اعتماد التحويل" });
      }
    });
  };

  const handleReject = (id: string) => {
    if (isReadOnly) return;
    if (!confirm("هل أنت متأكد من رفض هذا التحويل؟ سيتم حذف إثبات الدفع وإعادة الحجز لحالة بانتظار الدفع.")) return;

    setMessage(null);
    startTransition(async () => {
      const res = await rejectAppointmentPayment(id);
      if (res.success) {
        setTransfers((prev) => prev.filter((t) => t.id !== id));
        setMessage({ type: "success", text: "تم رفض التحويل وإعادة الجلسة لحالة بانتظار الدفع." });
      } else {
        setMessage({ type: "error", text: res.error || "فشل رفض التحويل" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold animate-fade-in ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {message.text}
        </div>
      )}

      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-indigo-500" /> طلبات اعتماد الحوالات المالية ({transfers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">المريض</th>
                <th className="px-6 py-4">الأخصائي</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">موعد الجلسة</th>
                <th className="px-6 py-4">إثبات الدفع</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{t.patient.name}</p>
                        <p className="text-xs text-slate-400 font-medium" dir="ltr">{t.patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">د. {t.therapist.name}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{t.price} ج.م</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {format(new Date(t.scheduledAt), "EEEE، d MMM · hh:mm a", { locale: arSA })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {t.paymentScreenshot ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(t.paymentScreenshot)}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                      >
                        <FileImage className="w-4 h-4" />
                        عرض الإيصال
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">لا يوجد إيصال</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending || isReadOnly}
                        onClick={() => handleApprove(t.id)}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm shadow-emerald-500/10"
                      >
                        <Check className="w-3.5 h-3.5" />
                        اعتماد
                      </button>
                      <button
                        type="button"
                        disabled={isPending || isReadOnly}
                        onClick={() => handleReject(t.id)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-red-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        رفض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    لا توجد حوالات معلقة بانتظار الاعتماد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">معاينة إثبات الدفع</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50 flex justify-center items-center max-h-[70vh] overflow-y-auto">
              <img
                src={selectedImage}
                alt="Payment Receipt"
                className="max-w-full h-auto object-contain rounded-xl shadow-md border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
