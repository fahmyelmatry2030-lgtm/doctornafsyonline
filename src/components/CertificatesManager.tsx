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
    if (!name.trim()) return;

    setUploading(true);
    setError("");

    try {
      // Mocking file upload and URL generation
      const mockUrl = `/mock-docs/${name.replace(/\s+/g, "_").toLowerCase()}_cert.pdf`;

      const res = await fetch("/api/therapist/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: mockUrl }),
      });

      if (res.ok) {
        setName("");
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
      <form onSubmit={handleAddCertificate} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: ترخيص مزاولة المهنة، ماجستير علم النفس الإكلينيكي"
            className="w-full rounded-xl border border-[var(--color-border-soft)] bg-white/50 py-3.5 pr-4 pl-4 text-slate-900 placeholder-slate-400 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !name.trim()}
          className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold px-6 py-3.5 shadow-md shadow-teal-700/10 hover:shadow-lg hover:shadow-teal-700/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              رفع الشهادة
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
