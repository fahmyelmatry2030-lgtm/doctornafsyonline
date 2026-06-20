"use client";

import { useState, useEffect } from "react";
import { 
  Award, Plus, Search, Trash2, Copy, Check, QrCode, X, 
  ExternalLink, Calendar, User, BookOpen, Clock, Loader2, RefreshCw, FileText
} from "lucide-react";

interface Certificate {
  code: string;
  traineeName: string;
  courseName: string;
  issueDate: string;
  grade?: string;
  hours?: number;
  instructor?: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
}

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTraineeName, setFormTraineeName] = useState("");
  const [formCourseName, setFormCourseName] = useState("");
  const [formIssueDate, setFormIssueDate] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formHours, setFormHours] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formCode, setFormCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal / QR code state
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/certificates");
      if (res.ok) {
        const data = await res.json();
        setCerts(data.certificates || []);
      } else {
        const err = await res.json();
        setError(err.error || "فشل تحميل الشهادات");
      }
    } catch {
      setError("حدث خطأ أثناء تحميل الشهادات");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchCertificates();
    setRefreshing(false);
  }

  async function handleAddCertificate(e: React.FormEvent) {
    e.preventDefault();
    if (!formTraineeName || !formCourseName || !formIssueDate) {
      setError("الرجاء ملء الحقول المطلوبة (اسم المتدرب، اسم الدورة، وتاريخ الإصدار)");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.trim(),
          traineeName: formTraineeName.trim(),
          courseName: formCourseName.trim(),
          issueDate: formIssueDate,
          grade: formGrade ? formGrade.trim() : undefined,
          hours: formHours ? Number(formHours) : undefined,
          instructor: formInstructor ? formInstructor.trim() : undefined,
          status: "ACTIVE"
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCerts(prev => [data.certificate, ...prev]);
        setSuccess(`تم إضافة شهادة المتدرب (${formTraineeName}) بنجاح!`);
        // Reset form
        setFormTraineeName("");
        setFormCourseName("");
        setFormIssueDate("");
        setFormGrade("");
        setFormHours("");
        setFormInstructor("");
        setFormCode("");
        setShowAddForm(false);
      } else {
        setError(data.error || "فشل إضافة الشهادة");
      }
    } catch {
      setError("حدث خطأ في الشبكة أثناء إضافة الشهادة");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCertificate(code: string, traineeName: string) {
    if (!confirm(`هل أنت متأكد من حذف شهادة المتدرب (${traineeName})؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/certificates?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCerts(prev => prev.filter(c => c.code !== code));
        setSuccess("تم حذف الشهادة بنجاح.");
        if (selectedCert?.code === code) {
          setSelectedCert(null);
        }
      } else {
        const data = await res.json();
        setError(data.error || "فشل حذف الشهادة");
      }
    } catch {
      setError("حدث خطأ أثناء محاولة حذف الشهادة");
    }
  }

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const verifyUrl = `${origin}/verify-certificate?code=${code}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getVerifyUrl = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/verify-certificate?code=${code}`;
  };

  // Filter certificates
  const filteredCerts = certs.filter(c => 
    c.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-600" />
            إعتماد وتوثيق الشهادات
          </h1>
          <p className="text-slate-500 mt-1">توليد شهادات الكورسات والتدريب للمتدربين مع أكواد QR للتحقق الخارجي المعتمد.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-5 h-5" /> إضافة شهادة جديدة
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">إجمالي الشهادات</span>
            <span className="text-2xl font-black text-slate-800">{certs.length}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">النشطة والمعتمدة</span>
            <span className="text-2xl font-black text-slate-800">
              {certs.filter(c => c.status === "ACTIVE").length}
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            <X className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">الملغاة</span>
            <span className="text-2xl font-black text-slate-800">
              {certs.filter(c => c.status === "REVOKED").length}
            </span>
          </div>
        </div>
      </div>

      {/* Add Certificate Form */}
      {showAddForm && (
        <form onSubmit={handleAddCertificate} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">إدخال شهادة متدرب جديدة</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">الاسم الكامل للمتدرب *</label>
              <input
                type="text"
                required
                value={formTraineeName}
                onChange={e => setFormTraineeName(e.target.value)}
                placeholder="أحمد محمد علي"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">اسم الدورة أو الكورس التدريبي *</label>
              <input
                type="text"
                required
                value={formCourseName}
                onChange={e => setFormCourseName(e.target.value)}
                placeholder="دبلومة العلاج المعرفي السلوكي"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">تاريخ إصدار الشهادة *</label>
              <input
                type="date"
                required
                value={formIssueDate}
                onChange={e => setFormIssueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">التقدير أو التقييم (اختياري)</label>
              <input
                type="text"
                value={formGrade}
                onChange={e => setFormGrade(e.target.value)}
                placeholder="امتياز / 95%"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">عدد الساعات التدريبية (اختياري)</label>
              <input
                type="number"
                value={formHours}
                onChange={e => setFormHours(e.target.value)}
                placeholder="40"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">اسم المحاضر أو المدرب (اختياري)</label>
              <input
                type="text"
                value={formInstructor}
                onChange={e => setFormInstructor(e.target.value)}
                placeholder="د. سمير صبري"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700">كود تحقق مخصص (اختياري - يترك فارغاً للتوليد التلقائي)</label>
              <input
                type="text"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                placeholder="NAFSI-CERT-5020"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ltr text-right"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              حفظ واعتماد الشهادة
            </button>
          </div>
        </form>
      )}

      {/* Search & List Section */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المتدرب، اسم الكورس، أو الكود..."
              className="w-full rounded-xl border border-slate-200 pr-10 pl-4 py-2.5 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400 font-bold">
            عدد النتائج: {filteredCerts.length} من {certs.length}
          </div>
        </div>

        {/* Certificates Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic">
            لا توجد شهادات مطابقة لبحثك.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/20 text-xs font-bold text-slate-400">
                  <th className="p-4">كود الشهادة</th>
                  <th className="p-4">اسم المتدرب</th>
                  <th className="p-4">الكورس / الدورة</th>
                  <th className="p-4">تاريخ الإصدار</th>
                  <th className="p-4">الساعات / التقدير</th>
                  <th className="p-4 text-center">حالة التحقق</th>
                  <th className="p-4 text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                {filteredCerts.map((cert) => (
                  <tr key={cert.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-black text-slate-800 ltr select-all">{cert.code}</td>
                    <td className="p-4 font-bold text-slate-900">{cert.traineeName}</td>
                    <td className="p-4 text-slate-600">{cert.courseName}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {cert.hours ? `${cert.hours} ساعة` : "—"}
                      {cert.grade ? ` / ${cert.grade}` : ""}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                        معتمد ونشط
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="عرض كود QR ورابط التحقق"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(cert.code)}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
                          title="نسخ رابط التحقق المباشر"
                        >
                          {copiedCode === cert.code ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={getVerifyUrl(cert.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                          title="معاينة صفحة التحقق"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteCertificate(cert.code, cert.traineeName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف الشهادة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code and Details Popup */}
      {selectedCert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-base">
                <QrCode className="w-5 h-5 text-indigo-600" />
                رمز الاستجابة السريعة للتحقق
              </h3>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-150 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center space-y-6">
              {/* QR Image */}
              <div className="bg-slate-50 p-6 rounded-2xl inline-block border border-slate-150 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getVerifyUrl(selectedCert.code))}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              {/* Trainee Details Summary */}
              <div className="text-right space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <span className="text-slate-400 font-bold">اسم المتدرب</span>
                  <span className="text-slate-850 font-black">{selectedCert.traineeName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <span className="text-slate-400 font-bold">اسم الكورس</span>
                  <span className="text-slate-800 font-black">{selectedCert.courseName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                  <span className="text-slate-400 font-bold">كود التحقق</span>
                  <span className="font-mono text-slate-800 font-black ltr">{selectedCert.code}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleCopyLink(selectedCert.code)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-xs"
                >
                  {copiedCode === selectedCert.code ? (
                    <>
                      <Check className="w-4 h-4" /> تم نسخ الرابط
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> نسخ رابط التوثيق المباشر
                    </>
                  )}
                </button>
                
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(getVerifyUrl(selectedCert.code))}`}
                  target="_blank"
                  download={`QR_${selectedCert.code}.png`}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs"
                >
                  <ExternalLink className="w-4 h-4" /> فتح كود QR بدقة عالية للطباعة
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
