"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, ShieldAlert, Star, UserCheck, Users, Award, 
  Check, X, ExternalLink, Ban, CheckCircle, Trash2, Search, FileText, QrCode 
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TherapistDetailsModal } from "./TherapistDetailsModal";
import Link from "next/link";

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

type TherapistsTableClientProps = {
  initialTherapists: Therapist[];
  toggleVerification: (userId: string, currentStatus: boolean) => Promise<void>;
  updateCertificateStatus: (userId: string, certId: string, status: "APPROVED" | "REJECTED") => Promise<void>;
  toggleSuspend: (userId: string, currentStatus: boolean) => Promise<void>;
  deleteTherapist: (userId: string) => Promise<void>;
  isReadOnly?: boolean;
};

export function TherapistsTableClient({
  initialTherapists,
  toggleVerification,
  updateCertificateStatus,
  toggleSuspend,
  deleteTherapist,
  isReadOnly = false,
}: TherapistsTableClientProps) {
  const searchParams = useSearchParams();
  const [therapists, setTherapists] = useState<Therapist[]>(initialTherapists);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  
  // Sync with URL search params
  useEffect(() => {
    const q = searchParams?.get("search");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Filter therapists by name, email, or specialization
  const filteredTherapists = therapists.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      (t.therapistProfile?.specializations && t.therapistProfile.specializations.toLowerCase().includes(query))
    );
  });

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleVerification(userId, currentStatus);
      setTherapists(prev => 
        prev.map(t => t.id === userId 
          ? { ...t, therapistProfile: t.therapistProfile ? { ...t.therapistProfile, isVerified: !currentStatus } : null } 
          : t
        )
      );
      if (selectedTherapist && selectedTherapist.id === userId) {
        setSelectedTherapist(prev => prev ? {
          ...prev,
          therapistProfile: prev.therapistProfile ? { ...prev.therapistProfile, isVerified: !currentStatus } : null
        } : null);
      }
    } catch {
      alert("حدث خطأ أثناء تعديل حالة التوثيق");
    }
  };

  const handleUpdateCertificateStatus = async (userId: string, certId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateCertificateStatus(userId, certId, status);
      setTherapists(prev => 
        prev.map(t => {
          if (t.id !== userId || !t.therapistProfile?.certificates) return t;
          const certs = JSON.parse(t.therapistProfile.certificates);
          const updated = certs.map((c: any) => c.id === certId ? { ...c, status } : c);
          return {
            ...t,
            therapistProfile: {
              ...t.therapistProfile,
              certificates: JSON.stringify(updated)
            }
          };
        })
      );
    } catch {
      alert("حدث خطأ أثناء مراجعة المستند");
    }
  };

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleSuspend(userId, currentStatus);
      setTherapists(prev => 
        prev.map(t => t.id === userId ? { ...t, isSuspended: !currentStatus } : t)
      );
      if (selectedTherapist && selectedTherapist.id === userId) {
        setSelectedTherapist(prev => prev ? { ...prev, isSuspended: !currentStatus } : null);
      }
    } catch {
      alert("حدث خطأ أثناء تعديل حالة الحساب");
    }
  };

  const handleDeleteTherapist = async (userId: string) => {
    try {
      await deleteTherapist(userId);
      setTherapists(prev => prev.filter(t => t.id !== userId));
      if (selectedTherapist && selectedTherapist.id === userId) {
        setSelectedTherapist(null);
      }
    } catch {
      alert("حدث خطأ أثناء حذف الحساب");
    }
  };

  const handleUpdateContractUrl = (userId: string, contractUrl: string) => {
    setTherapists(prev => 
      prev.map(t => t.id === userId 
        ? { ...t, therapistProfile: t.therapistProfile ? { ...t.therapistProfile, contractUrl } : null } 
        : t
      )
    );
    if (selectedTherapist && selectedTherapist.id === userId) {
      setSelectedTherapist(prev => prev ? {
        ...prev,
        therapistProfile: prev.therapistProfile ? { ...prev.therapistProfile, contractUrl } : null
      } : null);
    }
  };

  const verified = therapists.filter(t => t.therapistProfile?.isVerified);
  const pending = therapists.filter(t => !t.therapistProfile?.isVerified);
  const suspended = therapists.filter(t => t.isSuspended);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي الأخصائيين", value: therapists.length, icon: <Users className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "موثّقون", value: verified.length, icon: <ShieldCheck className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "قيد المراجعة", value: pending.length, icon: <ShieldAlert className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "موقوف", value: suspended.length, icon: <Ban className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-slate-100 p-5 flex items-center gap-4 bg-white shadow-sm">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو التخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          يظهر {filteredTherapists.length} من أصل {therapists.length} أخصائي
        </div>
      </div>

      {/* Pending Verification */}
      {pending.length > 0 && (
        <div className="glass rounded-3xl border border-amber-200 bg-amber-50/30 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-amber-800">طلبات التوثيق المعلقة ({pending.length})</h2>
          </div>
          <div className="divide-y divide-amber-100">
            {pending.map(t => (
              <div key={t.id} className="px-6 py-5 flex items-start justify-between gap-6 flex-wrap md:flex-nowrap">
                <div className="flex items-start gap-4">
                  {t.avatar ? (
                    <img src={encodeURI(decodeURI(t.avatar))} alt={t.name} className="w-12 h-12 rounded-full object-cover shrink-0 mt-1" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-lg shrink-0 mt-1">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div>
                      <button 
                        onClick={() => setSelectedTherapist(t)}
                        className="font-bold text-slate-800 text-base hover:text-indigo-600 transition-colors text-right"
                      >
                        {t.name}
                      </button>
                      <span className="text-xs text-slate-500 mr-2">({t.email})</span>
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold">{t.therapistProfile?.specializations || "—"}</p>
                    
                    {/* Certificates listing */}
                    <div className="mt-3 space-y-2 max-w-xl">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-500" /> الوثائق والشهادات المرفوعة للمراجعة:
                      </p>
                      {(() => {
                        if (!t.therapistProfile?.certificates) {
                          return <p className="text-xs text-slate-400 italic">لا توجد وثائق مرفوعة بعد.</p>;
                        }
                        try {
                          const certs = JSON.parse(t.therapistProfile.certificates);
                          if (certs.length === 0) {
                            return <p className="text-xs text-slate-400 italic">لا توجد وثائق مرفوعة بعد.</p>;
                          }
                          return (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {certs.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between gap-3 text-xs bg-white/70 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 leading-tight max-w-[150px] truncate">
                                    {c.name} <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      c.status === "APPROVED" ? "bg-green-50 text-green-700 border border-green-150" :
                                      c.status === "REJECTED" ? "bg-red-50 text-red-700 border border-red-150" : 
                                      "bg-amber-50 text-amber-700 border border-amber-150"
                                    }`}>
                                      {c.status === "APPROVED" ? "مقبول" : c.status === "REJECTED" ? "مرفوض" : "معلق"}
                                    </span>
                                    {c.status === "PENDING" && !isReadOnly && (
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleUpdateCertificateStatus(t.id, c.id, "APPROVED")} 
                                          className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors" 
                                          title="قبول الوثيقة"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateCertificateStatus(t.id, c.id, "REJECTED")} 
                                          className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors" 
                                          title="رفض الوثيقة"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        } catch {
                          return <p className="text-xs text-red-500">حدث خطأ في تحميل مستندات الشهادات</p>;
                        }
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 mt-3 md:mt-0">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">السعر/جلسة</p>
                    <p className="font-black text-slate-800 text-base">{t.therapistProfile?.pricePerSession} ج.م</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">الخبرة</p>
                    <p className="font-black text-slate-800 text-base">{t.therapistProfile?.yearsExperience} سنوات</p>
                  </div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => handleToggleVerification(t.id, false)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
                    >
                      <ShieldCheck className="w-4 h-4" /> توثيق الحساب
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Therapists Table */}
      <div className="card-glow glass rounded-3xl border border-slate-100 overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">جميع الأخصائيين</h2>
          <span className="text-sm text-slate-450 mr-auto">({filteredTherapists.length} أخصائي)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">الأخصائي والتراخيص</th>
                <th className="px-5 py-4">التخصصات</th>
                <th className="px-5 py-4">سعر الجلسة</th>
                <th className="px-5 py-4">الخبرة</th>
                <th className="px-5 py-4">التقييم</th>
                <th className="px-5 py-4">الجلسات</th>
                <th className="px-5 py-4">حالة التوثيق</th>
                <th className="px-5 py-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTherapists.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${t.isSuspended ? "bg-red-50/30" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img src={encodeURI(decodeURI(t.avatar))} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <button 
                          onClick={() => setSelectedTherapist(t)}
                          className="font-bold text-slate-800 text-sm hover:text-indigo-600 hover:underline transition-colors text-right"
                        >
                          {t.name}
                        </button>
                        <p className="text-xs text-slate-400">{t.email}</p>
                        
                        {/* Tiny certificates summary */}
                        {t.therapistProfile?.certificates && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(() => {
                              try {
                                const certs = JSON.parse(t.therapistProfile.certificates);
                                return certs.map((c: any) => (
                                  <span key={c.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    c.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-250" :
                                    c.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-255" :
                                    "bg-amber-50 text-amber-700 border-amber-250"
                                  }`} title={c.name}>
                                    {c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name}
                                  </span>
                                ));
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 max-w-[160px]">
                    <p className="text-xs text-slate-600 line-clamp-2">{t.therapistProfile?.specializations || "—"}</p>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-700 text-sm">{t.therapistProfile?.pricePerSession || "—"} ج.م</td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{t.therapistProfile?.yearsExperience || "—"} سنوات</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-sm text-slate-700">{t.therapistProfile?.rating?.toFixed(1) || "—"}</span>
                      <span className="text-xs text-slate-400">({t.therapistProfile?.reviewCount || 0})</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-black text-indigo-600">{t._count.therapistAppointments}</td>
                  <td className="px-5 py-3.5">
                    {t.therapistProfile?.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> موثق
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-250 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" /> معلق
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-1.5">
                      {/* View Profile details modal - always visible */}
                      <button 
                        onClick={() => setSelectedTherapist(t)}
                        title="عرض الملف المهني الكامل للأخصائي"
                        className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {/* QR Badge button - always visible */}
                      <Link
                        href={`/admin/therapists/badge/${t.id}`}
                        title="بطاقة الهوية ورمز QR"
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </Link>
                      {/* Action buttons - hidden for ADMIN_VIEWER */}
                      {!isReadOnly && (
                        <>
                          {/* Verify / Unverify */}
                          <button 
                            onClick={() => handleToggleVerification(t.id, t.therapistProfile?.isVerified || false)}
                            title={t.therapistProfile?.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                              t.therapistProfile?.isVerified
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          {/* Suspend / Unsuspend */}
                          <button 
                            onClick={() => handleToggleSuspend(t.id, t.isSuspended)}
                            title={t.isSuspended ? "رفع الإيقاف" : "إيقاف الحساب"}
                            className={`p-2 rounded-lg transition-colors ${
                              t.isSuspended
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {t.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          {/* Delete */}
                          <button 
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حساب الأخصائي ${t.name}؟`)) {
                                handleDeleteTherapist(t.id);
                              }
                            }}
                            title="حذف الحساب"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTherapists.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    لا توجد نتائج مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Therapist Details Modal */}
      {selectedTherapist && (
        <TherapistDetailsModal
          therapist={selectedTherapist}
          onClose={() => setSelectedTherapist(null)}
          onToggleVerification={handleToggleVerification}
          onToggleSuspend={handleToggleSuspend}
          onDelete={handleDeleteTherapist}
          onUpdateCertificate={handleUpdateCertificateStatus}
          onUpdateContractUrl={handleUpdateContractUrl}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}
