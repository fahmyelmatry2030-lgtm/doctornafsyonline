"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";

type Certificate = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function CertificatesManager() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCerts();
  }, []);

  async function fetchCerts() {
    try {
      const res = await fetch("/api/therapist/certificates");
      if (res.ok) {
        const data = await res.json();
        setCerts(data);
      }
    } catch {
      setError("فشل تحميل الشهادات");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCertificate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedFile) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", selectedFile);

      const res = await fetch("/api/therapist/certificates", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setName("");
        setSelectedFile(null);
        // Reset file input element visually
        const fileInput = document.getElementById("cert-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        await fetchCerts();
      } else {
        const errData = await res.json();
        setError(errData.error || "فشل إضافة الشهادة");
      }
    } catch {
      setError("حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الشهادة؟")) return;

    try {
      const res = await fetch("/api/therapist/certificates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchCerts();
      } else {
        setError("فشل حذف الشهادة");
      }
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  }

  const statusMap = {
    APPROVED: {
      label: "مقبول ✓",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    },
    PENDING: {
      label: "قيد المراجعة ⌛",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    REJECTED: {
      label: "مرفوض ✗",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-4 h-4 text-red-600" />,
    },
  };

  return (
    <div className="space-y-6">
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">الشهادات الطبية والاعتمادات المهنية</h3>
        <p className="text-sm text-slate-500 mb-4">
          يرجى رفع الشهادات الأكاديمية والمهنية وتراخيص مزاولة المهنة لتوثيق حسابك.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <form onSubmit={handleAddCertificate} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-600 block">اسم الشهادة / الترخيص</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: ترخيص مزاولة المهنة، ماجستير علم النفس الإكلينيكي"
            className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white py-3 pr-4 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm text-sm"
          />
        </div>
        
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-slate-600 block font-bold">ملف الشهادة (صورة أو PDF)</label>
          <div className="relative flex items-center">
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="cert-file-input"
            />
            <label
              htmlFor="cert-file-input"
              className="w-full flex items-center justify-between cursor-pointer rounded-xl border border-dashed border-indigo-200 bg-white hover:bg-indigo-50/20 py-3 px-4 text-slate-700 transition-all shadow-sm text-sm"
            >
              <span className="text-slate-500 truncate max-w-[200px]">
                {selectedFile ? selectedFile.name : "اختر ملف الشهادة..."}
              </span>
              <UploadCloud className="w-4 h-4 text-indigo-500 shrink-0 mr-2" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !name.trim() || !selectedFile}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold px-6 py-3 shadow-md shadow-teal-700/10 hover:shadow-lg hover:shadow-teal-700/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all h-[46px] text-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              رفع وحفظ الشهادة
            </>
          )}
        </button>
      </form>

      {/* Certificates List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : certs.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">لم تقم برفع أي شهادات أو اعتمادات بعد.</p>
          </div>
        ) : (
          certs.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{cert.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    تم الرفع في: {new Date(cert.uploadedAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${
                    statusMap[cert.status]?.className || ""
                  }`}
                >
                  {statusMap[cert.status]?.icon}
                  {statusMap[cert.status]?.label}
                </span>

                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="حذف الشهادة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
