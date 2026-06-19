"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";

export default function ContractManager() {
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContract();
  }, []);

  async function fetchContract() {
    try {
      const res = await fetch("/api/therapist/contract");
      if (res.ok) {
        const data = await res.json();
        setContractUrl(data.contractUrl);
      }
    } catch {
      setError("فشل تحميل عقد المنصة");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("حجم الملف يجب ألا يتجاوز 10 ميجابايت");
      return;
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("يرجى اختيار ملف PDF أو صورة صالحة للتحميل (PDF, JPG, PNG)");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/therapist/contract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setContractUrl(data.contractUrl);
        setSuccessMsg("تم رفع العقد الموقّع بنجاح وجاري مراجعته من قبل الإدارة.");
      } else {
        setError(data.error || "فشل رفع العقد");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم لرفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 border-t border-slate-100 pt-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png,image/jpg"
        className="hidden"
      />

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">عقد المنصة المعتمد</h3>
        <p className="text-sm text-slate-500">
          يرجى تحميل العقد الموحد للمنصة، توقيعه بصيغة PDF، وإعادة رفعه هنا لتوثيق وتفعيل حسابك بشكل رسمي.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Download Contract Section */}
          <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md font-bold inline-block mb-2">النموذج الرسمي</span>
              <h4 className="font-bold text-slate-800 text-sm">عقد تقديم الخدمات الطبية والنفسية للمنصة</h4>
              <p className="text-xs text-slate-500 mt-1">تنزيل نموذج العقد الرسمي الفارغ بصيغة PDF لتوقيعه يدوياً أو إلكترونياً.</p>
            </div>
            <a 
              href="/docs/nafsi_therapist_contract_template.pdf"
              target="_blank"
              download
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> تحميل نموذج العقد
            </a>
          </div>

          {/* Upload Status Section */}
          <div className="p-5 rounded-2xl border border-slate-150 bg-white flex flex-col justify-between gap-4">
            {contractUrl ? (
              <>
                <div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold inline-block mb-2">حالة العقد</span>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="font-bold text-slate-800 text-sm">تم رفع العقد الموقّع بنجاح</h4>
                  </div>
                  <p className="text-xs text-slate-500">تم تسجيل نسختك الموقّعة في قاعدة بيانات المنصة ومتاحة للأدمن للمراجعة.</p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl py-3 hover:bg-indigo-100 transition-colors text-center"
                  >
                    <FileText className="w-4 h-4" /> استعراض عقدي الموقّع
                  </a>
                  <button 
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={uploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    تحديث العقد
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-bold inline-block mb-2">حالة العقد</span>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <h4 className="font-bold text-slate-800 text-sm">مطلوب توقيع العقد ورفعه</h4>
                  </div>
                  <p className="text-xs text-slate-500">يتطلب تفعيل ملفك المهني وفتح الحجوزات رفع العقد الموقّع أولاً.</p>
                </div>
                <button 
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl py-3 hover:opacity-95 transition-all shadow-md shadow-teal-600/10 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      رفع العقد الموقع (PDF/صورة)
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
