"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  X, Mail, Phone, Calendar, Star, Award, ShieldCheck, ShieldAlert, 
  FileText, Download, UploadCloud, Ban, CheckCircle, Trash2, Loader2, Link as LinkIcon
} from "lucide-react";

type Therapist = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string | Date;
  isSuspended: boolean;
  therapistProfile: {
    bio: string;
    specializations: string;
    pricePerSession: number;
    yearsExperience: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    certificates: string | null;
    contractUrl: string | null;
  } | null;
  _count: {
    therapistAppointments: number;
  };
};

type TherapistDetailsModalProps = {
  therapist: Therapist;
  onClose: () => void;
  onToggleVerification: (userId: string, currentStatus: boolean) => Promise<void>;
  onToggleSuspend: (userId: string, currentStatus: boolean) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onUpdateCertificate: (userId: string, certId: string, status: "APPROVED" | "REJECTED") => Promise<void>;
  isReadOnly?: boolean;
};

export function TherapistDetailsModal({ 
  therapist, 
  onClose, 
  onToggleVerification, 
  onToggleSuspend, 
  onDelete,
  onUpdateCertificate,
  isReadOnly = false
}: TherapistDetailsModalProps) {
  const [localTherapist, setLocalTherapist] = useState<Therapist>(therapist);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [selectedContractFile, setSelectedContractFile] = useState<File | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = localTherapist.therapistProfile;
  const certs = profile?.certificates ? JSON.parse(profile.certificates) : [];

  const handleToggleVerification = async () => {
    if (isReadOnly) return;
    setActionLoading(true);
    try {
      const currentStatus = profile?.isVerified || false;
      await onToggleVerification(localTherapist.id, currentStatus);
      setLocalTherapist(prev => ({
        ...prev,
        therapistProfile: prev.therapistProfile ? {
          ...prev.therapistProfile,
          isVerified: !currentStatus
        } : null
      }));
    } catch {
      setError("حدث خطأ أثناء تعديل حالة التوثيق");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (isReadOnly) return;
    setActionLoading(true);
    try {
      const currentStatus = localTherapist.isSuspended;
      await onToggleSuspend(localTherapist.id, currentStatus);
      setLocalTherapist(prev => ({
        ...prev,
        isSuspended: !currentStatus
      }));
    } catch {
      setError("حدث خطأ أثناء تعديل حالة الحساب");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCertificateStatus = async (certId: string, status: "APPROVED" | "REJECTED") => {
    if (isReadOnly) return;
    try {
      await onUpdateCertificate(localTherapist.id, certId, status);
      const updatedCerts = certs.map((c: any) => c.id === certId ? { ...c, status } : c);
      setLocalTherapist(prev => ({
        ...prev,
        therapistProfile: prev.therapistProfile ? {
          ...prev.therapistProfile,
          certificates: JSON.stringify(updatedCerts)
        } : null
      }));
    } catch {
      setError("حدث خطأ أثناء تحديث حالة الشهادة");
    }
  };

  const handleUploadContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!selectedContractFile) {
      setError("يرجى اختيار ملف عقد بصيغة PDF قبل الرفع.");
      return;
    }

    setUploadingContract(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedContractFile);
      formData.append("therapistId", localTherapist.id);

      const res = await fetch("/api/therapist/contract", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setLocalTherapist(prev => ({
          ...prev,
          therapistProfile: prev.therapistProfile ? {
            ...prev.therapistProfile,
            contractUrl: data.contractUrl
          } : null
        }));
        setSelectedContractFile(null);
      } else {
        const errData = await res.json();
        setError(errData.error || "فشل رفع عقد المنصة");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setUploadingContract(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-fade-in border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-600/10">
              {localTherapist.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">{localTherapist.name}</h2>
                {profile?.isVerified ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> موثق
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> معلق
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">تاريخ الانضمام: {new Date(localTherapist.createdAt).toLocaleDateString("ar-EG")}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm font-bold"
          >
            <X className="w-4 h-4" /> إغلاق الملف
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">البريد الإلكتروني</span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1 truncate" title={localTherapist.email}>
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {localTherapist.email}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">رقم الهاتف</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" /> {localTherapist.phone || "—"}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">سعر الجلسة / الخبرة</span>
              <span className="text-sm font-black text-slate-800 block">
                {profile?.pricePerSession} ج.م · {profile?.yearsExperience} سنوات خبرة
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي الجلسات / التقييم</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black text-slate-800">{localTherapist._count.therapistAppointments} جلسة</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm font-black text-slate-800 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {profile?.rating.toFixed(1)} ({profile?.reviewCount})
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Right Column: Bio & Specializations */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-3">التخصصات الطبية والمهنية</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.specializations.split(/[,،]+/).map((spec, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                      {spec.trim()}
                    </span>
                  )) || <span className="text-slate-400 italic">لا توجد تخصصات مسجلة</span>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 mb-3">النبذة التعريفية (Bio)</h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || <span className="text-slate-400 italic">لا توجد نبذة تعريفية مسجلة.</span>}
                </div>
              </div>
            </div>

            {/* Left Column: Actions & Platform Contract */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">عقد المنصة المبرم</h4>
                {profile?.contractUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-bold">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>تم توقيع العقد وإرفاقه بنجاح</span>
                    </div>
                    <a 
                      href={profile.contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-white border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" /> تحميل العقد الموقّع
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>العقد لم يرفع بعد من الأخصائي</span>
                  </div>
                )}

                {/* Upload/Replace contract by Admin */}
                {!isReadOnly && (
                  <form onSubmit={handleUploadContract} className="pt-2 border-t border-slate-200/50 space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="contractFile" className="block text-xs font-semibold text-slate-700">
                        اختيار ملف عقد PDF
                      </label>
                      <input
                        id="contractFile"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] || null;
                          setError("");
                          setSelectedContractFile(file);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                      {selectedContractFile && (
                        <p className="text-xs text-slate-500">الملف المحدد: {selectedContractFile.name}</p>
                      )}
                    </div>
                    <button 
                      type="submit"
                      disabled={uploadingContract || !selectedContractFile}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {uploadingContract ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      {profile?.contractUrl ? "استبدال العقد الموقّع" : "رفع عقد للأخصائي"}
                    </button>
                  </form>
                )}

                <div className="mt-4 border-t border-slate-200/50 pt-4 text-xs text-slate-500 space-y-2">
                  <p className="font-semibold text-slate-700">تذكير بالعقود والسياسات</p>
                  <p>
                    عند قبول العقد، يجب أن يكون الأخصائي ومستخدمي الخدمة على علم بـ 
                    <Link href="/terms" className="text-indigo-600 font-semibold hover:underline">
                      الشروط والأحكام
                    </Link>
                    {' '}و
                    <Link href="/privacy" className="text-indigo-600 font-semibold hover:underline">
                      سياسة الخصوصية
                    </Link>
                    .
                  </p>
                  <p className="text-slate-400">يمكن عرض هذه المستندات أو تنزيلها من الصفحات العامة للمنصة.</p>
                </div>
              </div>

              {/* Status control */}
              <div className="p-5 rounded-2xl border border-slate-150 bg-white space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">حالة الحساب والتوثيق</h4>
                {isReadOnly ? (
                  <div className="text-xs text-slate-400 font-semibold text-center py-2">
                    وضع العرض فقط — لا يمكن تعديل الحساب أو حذفه.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <button
                      onClick={handleToggleVerification}
                      disabled={actionLoading}
                      className={`w-full inline-flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl border transition-colors ${
                        profile?.isVerified
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-md shadow-emerald-600/10"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {profile?.isVerified ? "إلغاء توثيق الحساب" : "توثيق حساب الأخصائي"}
                    </button>

                    <button
                      onClick={handleToggleSuspend}
                      disabled={actionLoading}
                      className={`w-full inline-flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl border transition-colors ${
                        localTherapist.isSuspended
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-250 hover:bg-amber-100"
                      }`}
                    >
                      {localTherapist.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      {localTherapist.isSuspended ? "تفعيل حساب الأخصائي" : "إيقاف حساب الأخصائي مؤقتاً"}
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`هل أنت متأكد من حذف حساب الأخصائي ${localTherapist.name} نهائياً من النظام؟`)) {
                          await onDelete(localTherapist.id);
                          onClose();
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف الحساب نهائياً
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificates Review */}
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> التراخيص الطبية والشهادات المرفوعة للمراجعة
            </h3>
            {certs.length === 0 ? (
              <p className="text-slate-400 text-sm italic bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                لا توجد تراخيص أو شهادات مرفوعة بعد من قبل هذا الأخصائي.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {certs.map((c: any) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <a 
                          href={c.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-slate-800 text-sm hover:text-indigo-600 flex items-center gap-1 transition-colors leading-tight"
                        >
                          {c.name} <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          تاريخ الرفع: {new Date(c.uploadedAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                        c.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" : 
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {c.status === "APPROVED" ? "مقبول ✓" : c.status === "REJECTED" ? "مرفوض ✗" : "معلق ⌛"}
                      </span>

                      {c.status === "PENDING" && !isReadOnly && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleCertificateStatus(c.id, "APPROVED")} 
                            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-md transition-colors" 
                            title="قبول الشهادة"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleCertificateStatus(c.id, "REJECTED")} 
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md transition-colors" 
                            title="رفض الشهادة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
