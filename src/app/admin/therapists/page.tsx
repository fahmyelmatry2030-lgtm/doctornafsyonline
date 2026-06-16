import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ShieldCheck, ShieldAlert, Star, UserCheck, Users, Award, Check, X, ExternalLink, Ban, CheckCircle, Trash2 } from "lucide-react";

export default async function AdminTherapistsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const therapists = await prisma.user.findMany({
    where: { role: "THERAPIST" },
    include: {
      therapistProfile: true,
      _count: { select: { therapistAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const verified = therapists.filter(t => t.therapistProfile?.isVerified);
  const pending = therapists.filter(t => !t.therapistProfile?.isVerified);
  const suspended = therapists.filter(t => t.isSuspended);

  async function toggleVerification(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.therapistProfile.update({
      where: { userId },
      data: { isVerified: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function updateCertificateStatus(userId: string, certId: string, status: "APPROVED" | "REJECTED") {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      select: { certificates: true }
    });
    if (!profile) return;
    const certs = profile.certificates ? JSON.parse(profile.certificates) : [];
    const updated = certs.map((c: any) => c.id === certId ? { ...c, status } : c);
    
    await prisma.therapistProfile.update({
      where: { userId },
      data: { certificates: JSON.stringify(updated) }
    });
    revalidatePath("/admin/therapists");
  }

  async function toggleSuspend(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
    revalidatePath("/admin/therapists");
  }

  async function deleteTherapist(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/therapists");
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الأخصائيين</h1>
          <p className="text-slate-500 mt-1">مراجعة وتوثيق حسابات الأخصائيين المسجلين في المنصة</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي الأخصائيين", value: therapists.length, icon: <Users className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "موثّقون", value: verified.length, icon: <ShieldCheck className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "قيد المراجعة", value: pending.length, icon: <ShieldAlert className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "موقوف", value: suspended.length, icon: <Ban className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-[var(--color-border-soft)] p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Verification - highlight section */}
      {pending.length > 0 && (
        <div className="glass rounded-3xl border border-amber-200 bg-amber-50/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-amber-800">طلبات التوثيق المعلقة ({pending.length})</h2>
          </div>
          <div className="divide-y divide-amber-100">
            {pending.map(t => (
              <div key={t.id} className="px-6 py-5 flex items-start justify-between gap-6 flex-wrap md:flex-nowrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-lg shrink-0 mt-1">
                    {t.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="font-bold text-slate-800 text-base">{t.name}</span>
                      <span className="text-xs text-slate-500 mr-2">({t.email})</span>
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold">{t.therapistProfile?.specializations || "—"}</p>
                    
                    {/* Certificates listing and review */}
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
                                    {c.status === "PENDING" && (
                                      <div className="flex gap-1">
                                        <form action={updateCertificateStatus.bind(null, t.id, c.id, "APPROVED")}>
                                          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md transition-colors" title="قبول الوثيقة">
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                        </form>
                                        <form action={updateCertificateStatus.bind(null, t.id, c.id, "REJECTED")}>
                                          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors" title="رفض الوثيقة">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </form>
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
                  <form action={toggleVerification.bind(null, t.id, false)}>
                    <button type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/10">
                      <ShieldCheck className="w-4 h-4" /> توثيق الحساب
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Therapists Table */}
      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">جميع الأخصائيين</h2>
          <span className="text-sm text-slate-400 mr-auto">({therapists.length} أخصائي)</span>
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
              {therapists.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.email}</p>
                        
                        {/* Tiny certificates summary badge in the table */}
                        {t.therapistProfile?.certificates && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(() => {
                              try {
                                const certs = JSON.parse(t.therapistProfile.certificates);
                                return certs.map((c: any) => (
                                  <span key={c.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    c.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                                    c.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-amber-50 text-amber-700 border-amber-200"
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
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> موثق
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" /> معلق
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-1.5">
                      {/* Verify / Unverify */}
                      <form action={toggleVerification.bind(null, t.id, t.therapistProfile?.isVerified || false)}>
                        <button type="submit" title={t.therapistProfile?.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                          className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                            t.therapistProfile?.isVerified
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </form>
                      {/* Suspend / Unsuspend */}
                      <form action={toggleSuspend.bind(null, t.id, t.isSuspended)}>
                        <button type="submit" title={t.isSuspended ? "رفع الإيقاف" : "إيقاف الحساب"}
                          className={`p-2 rounded-lg transition-colors ${
                            t.isSuspended
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          }`}>
                          {t.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </form>
                      {/* Delete */}
                      <form action={deleteTherapist.bind(null, t.id)}>
                        <button type="submit" title="حذف الحساب"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {therapists.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    لا يوجد أخصائيون مسجلون بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
