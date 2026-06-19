"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScreenshotUploader({ appointmentId }: { appointmentId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("حجم الملف يجب ألا يتجاوز 8 ميجابايت");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("يرجى اختيار صورة صالحة أو ملف PDF");
      return;
    }

    setError("");
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/appointments/${appointmentId}/screenshot`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(data.error || "فشل رفع إثبات الدفع");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-2 space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        className="hidden"
      />

      {success ? (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تم رفع إثبات الدفع! بانتظار مراجعة الإدارة.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={triggerFileSelect}
            className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-indigo-200"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                جاري رفع الإثبات...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                رفع إثبات الدفع (Screenshot)
              </>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-1.5 p-2 bg-red-50 text-red-700 rounded-lg text-[10px] font-semibold border border-red-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
