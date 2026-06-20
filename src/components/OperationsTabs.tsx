"use client";

import { useState, useTransition } from "react";
import { 
  Calendar, Clock, DollarSign, TrendingUp, FileText, FileImage,
  Video, Headphones, MessageSquare, Check, X, Search, 
  AlertCircle, ChevronDown, Award, ExternalLink 
} from "lucide-react";
import { updateAppointmentStatus, rejectAppointmentPayment } from "@/app/admin/operations/actions";

type Appointment = {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: Date | string;
  duration: number;
  type: "VIDEO" | "AUDIO" | "CHAT";
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  price: number;
  roomName: string;
  notes: string | null;
  paymentScreenshot: string | null;
  createdAt: Date | string;
  patient: { name: string; email: string };
  therapist: { name: string };
  review?: { rating: number; comment: string | null } | null;
  sessionNote?: { notes: string } | null;
};

interface OperationsTabsProps {
  initialAppointments: Appointment[];
  commissionRate: number;
  isReadOnly?: boolean;
}

export function OperationsTabs({ initialAppointments, commissionRate, isReadOnly = false }: OperationsTabsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activeTab, setActiveTab] = useState<"bookings" | "sessions" | "payments">("bookings");
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filters
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("ALL");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("ALL");
  
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: Appointment["status"]) => {
    if (isReadOnly) return;
    setActionMessage(null);
    startTransition(async () => {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setAppointments(prev => 
          prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
        );
        setActionMessage({ type: "success", text: "تم تحديث حالة الموعد بنجاح!" });
      } else {
        setActionMessage({ type: "error", text: res.error || "فشل تحديث الحالة" });
      }
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  const handleRejectPayment = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm("هل أنت متأكد من رفض هذا التحويل؟ سيتم حذف إثبات الدفع وإعادة الحجز لحالة بانتظار الدفع.")) return;

    setActionMessage(null);
    startTransition(async () => {
      const res = await rejectAppointmentPayment(id);
      if (res.success) {
        setAppointments(prev => 
          prev.map(app => app.id === id ? { ...app, paymentScreenshot: null, status: "PENDING" } : app)
        );
        setActionMessage({ type: "success", text: "تم رفض التحويل وإعادة الجلسة لحالة بانتظار الدفع." });
      } else {
        setActionMessage({ type: "error", text: res.error || "فشل رفض التحويل" });
      }
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  // Status mapping
  const statusLabel: Record<Appointment["status"], string> = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكدة",
    IN_PROGRESS: "جارية الآن",
    COMPLETED: "مكتملة",
    CANCELLED: "ملغية",
  };

  const statusColor: Record<Appointment["status"], string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-green-50 text-green-700 border-green-200 animate-pulse",
    COMPLETED: "bg-slate-50 text-slate-600 border-slate-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };

  const typeIcon: Record<Appointment["type"], React.ReactNode> = {
    VIDEO: <Video className="w-3.5 h-3.5" />,
    AUDIO: <Headphones className="w-3.5 h-3.5" />,
    CHAT: <MessageSquare className="w-3.5 h-3.5" />,
  };

  const typeLabel: Record<Appointment["type"], string> = {
    VIDEO: "فيديو",
    AUDIO: "صوت",
    CHAT: "محادثة نصية",
  };

  // Filter logic
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      app.patient.email.toLowerCase().includes(search.toLowerCase()) ||
      app.therapist.name.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "bookings") {
      return bookingStatusFilter === "ALL" || app.status === bookingStatusFilter;
    }

    if (activeTab === "sessions") {
      const matchesType = sessionTypeFilter === "ALL" || app.type === sessionTypeFilter;
      const matchesStatus = sessionStatusFilter === "ALL" || app.status === sessionStatusFilter;
      return matchesType && matchesStatus;
    }

    if (activeTab === "payments") {
      // Payouts tab shows only completed or cancelled appointments (financial events)
      return app.status === "COMPLETED" || app.status === "CANCELLED";
    }

    return true;
  });

  // Financial calculations
  const totalRevenue = appointments
    .filter(a => a.status === "COMPLETED")
    .reduce((s, a) => s + a.price, 0);

  const platformRevenue = Math.round(totalRevenue * (commissionRate / 100));
  const therapistRevenue = totalRevenue - platformRevenue;
  
  const completedCount = appointments.filter(a => a.status === "COMPLETED").length;
  const cancelledCount = appointments.filter(a => a.status === "CANCELLED").length;
  const activeCount = appointments.filter(a => a.status === "IN_PROGRESS").length;
  const pendingCount = appointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      {/* Action alert */}
      {actionMessage && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold animate-fade-in ${
          actionMessage.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <AlertCircle className="w-4 h-4" />
          {actionMessage.text}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1 shrink-0">
          {[
            { id: "bookings", label: "إدارة الحجوزات", icon: <Calendar className="w-4 h-4" /> },
            { id: "sessions", label: "إدارة الجلسات", icon: <Clock className="w-4 h-4" /> },
            { id: "payments", label: "إدارة المدفوعات والأرباح", icon: <DollarSign className="w-4 h-4" /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Global search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم المريض، الأخصائي أو المعرف..."
            className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
      </div>

      {/* Tab: Bookings (إدارة الحجوزات) */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-bold text-slate-500 ml-2">تصفية حسب الحالة:</span>
            {[
              { id: "ALL", label: "الكل" },
              { id: "PENDING", label: "قيد الانتظار" },
              { id: "CONFIRMED", label: "مؤكدة" },
              { id: "CANCELLED", label: "ملغية" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setBookingStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  bookingStatusFilter === f.id 
                    ? "bg-indigo-600 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">رقم الحجز</th>
                    <th className="px-5 py-4">المريض</th>
                    <th className="px-5 py-4">الأخصائي</th>
                    <th className="px-5 py-4">تاريخ الموعد</th>
                    <th className="px-5 py-4">سعر الجلسة</th>
                    <th className="px-5 py-4">إثبات الدفع</th>
                    <th className="px-5 py-4">الحالة</th>
                    <th className="px-5 py-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        {app.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{app.patient.name}</p>
                        <p className="text-xs text-slate-400">{app.patient.email}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        د. {app.therapist.name}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {new Date(app.scheduledAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                        <br />
                        <span className="text-slate-400">{new Date(app.scheduledAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {app.price} ج.م
                      </td>
                      <td className="px-5 py-4">
                        {app.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(app.paymentScreenshot)}
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                          >
                            <FileImage className="w-3.5 h-3.5" />
                            عرض الإيصال
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">لا يوجد إيصال</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${statusColor[app.status]}`}>
                          {statusLabel[app.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 justify-center">
                          {isReadOnly ? (
                            <span className="text-xs text-slate-400 font-semibold">عرض فقط</span>
                          ) : (
                            <>
                              {app.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(app.id, "CONFIRMED")}
                                    disabled={isPending}
                                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" /> تأكيد الحجز
                                  </button>
                                  {app.paymentScreenshot && (
                                    <button
                                      onClick={() => handleRejectPayment(app.id)}
                                      disabled={isPending}
                                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-red-200"
                                    >
                                      <X className="w-3.5 h-3.5" /> رفض الإيصال
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleStatusUpdate(app.id, "CANCELLED")}
                                    disabled={isPending}
                                    className="flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> إلغاء الحجز
                                  </button>
                                </>
                              )}
                              {app.status === "CONFIRMED" && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, "CANCELLED")}
                                  disabled={isPending}
                                  className="flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" /> إلغاء الحجز
                                </button>
                              )}
                              {["COMPLETED", "CANCELLED", "IN_PROGRESS"].includes(app.status) && (
                                <span className="text-xs text-slate-400 font-semibold">—</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        لا توجد حجوزات تطابق المعايير المحددة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sessions (إدارة الجلسات) */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {/* Advanced filters */}
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex gap-1.5 items-center">
              <span className="text-xs font-bold text-slate-500">النوع:</span>
              <select
                value={sessionTypeFilter}
                onChange={e => setSessionTypeFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none"
              >
                <option value="ALL">الكل</option>
                <option value="VIDEO">فيديو</option>
                <option value="AUDIO">صوت</option>
                <option value="CHAT">نصية</option>
              </select>
            </div>

            <div className="flex gap-1.5 items-center">
              <span className="text-xs font-bold text-slate-500">حالة الجلسة:</span>
              <select
                value={sessionStatusFilter}
                onChange={e => setSessionStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none"
              >
                <option value="ALL">الكل</option>
                <option value="IN_PROGRESS">جارية الآن</option>
                <option value="COMPLETED">مكتملة</option>
                <option value="CONFIRMED">قادمة (مؤكدة)</option>
                <option value="PENDING">معلقة</option>
              </select>
            </div>
          </div>

          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">رقم الجلسة</th>
                    <th className="px-5 py-4">المريض والمستشار</th>
                    <th className="px-5 py-4">نوع الاتصال</th>
                    <th className="px-5 py-4">الغرفة والمدة</th>
                    <th className="px-5 py-4">حالة الاتصال</th>
                    <th className="px-5 py-4">ملاحظات الجلسة</th>
                    <th className="px-5 py-4 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        {app.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-sm">{app.patient.name}</div>
                        <div className="text-xs text-slate-500">أخصائي: د. {app.therapist.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                          {typeIcon[app.type]}
                          {typeLabel[app.type]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">
                          {app.roomName}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{app.duration} دقيقة</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${statusColor[app.status]}`}>
                          {statusLabel[app.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        {app.sessionNote ? (
                          <div className="text-xs text-slate-600 line-clamp-2" title={app.sessionNote.notes}>
                            {app.sessionNote.notes}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">لا توجد ملاحظات بعد</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 justify-center">
                          {isReadOnly ? (
                            <>
                              {app.status === "COMPLETED" && (
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                                  ✓ مكتملة
                                </span>
                              )}
                              {app.status === "PENDING" && (
                                <span className="text-xs text-slate-400 font-semibold">بانتظار التأكيد</span>
                              )}
                              {app.status === "CANCELLED" && (
                                <span className="text-xs text-red-500 font-bold">ملغية</span>
                              )}
                              {app.status === "CONFIRMED" && (
                                <span className="text-xs text-slate-400 font-semibold">قادمة (مؤكدة)</span>
                              )}
                              {app.status === "IN_PROGRESS" && (
                                <span className="text-xs text-green-600 font-bold">جارية الآن</span>
                              )}
                            </>
                          ) : (
                            <>
                              {app.status === "IN_PROGRESS" && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, "COMPLETED")}
                                  disabled={isPending}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                                >
                                  إنهاء الجلسة
                                </button>
                              )}
                              {app.status === "CONFIRMED" && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, "IN_PROGRESS")}
                                  disabled={isPending}
                                  className="border border-green-600 text-green-700 hover:bg-green-50 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                                >
                                  بدء الجلسة
                                </button>
                              )}
                              {app.status === "COMPLETED" && (
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                                  ✓ مكتملة
                                </span>
                              )}
                              {app.status === "PENDING" && (
                                <span className="text-xs text-slate-400 font-semibold">بانتظار التأكيد</span>
                              )}
                              {app.status === "CANCELLED" && (
                                <span className="text-xs text-red-500 font-bold">ملغية</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        لا توجد جلسات مطابقة للفلاتر.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payments (إدارة المدفوعات والأرباح) */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Financial summary blocks */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "إجمالي المدفوعات المحصلة", value: `${totalRevenue.toLocaleString()} ج.م`, desc: `من إجمالي ${completedCount} جلسة مكتملة`, icon: <DollarSign className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "حصة المنصة المحققة", value: `${platformRevenue.toLocaleString()} ج.م`, desc: `بنسبة عمولة ${commissionRate}% ديناميكياً`, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "حصة الأخصائيين المستحقة", value: `${therapistRevenue.toLocaleString()} ج.م`, desc: `بنسبة ${100 - commissionRate}% للشركاء الأخصائيين`, icon: <Award className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-2xl border border-[var(--color-border-soft)] p-5 flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl shrink-0`}>{stat.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color} leading-tight`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                سجل الفواتير والعمليات المالية
              </h3>
              <span className="text-xs text-slate-400">فقط العمليات المالية للحجوزات المكتملة أو الملغية</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4">كود العملية</th>
                    <th className="px-5 py-4">المريض والبريد</th>
                    <th className="px-5 py-4">الأخصائي</th>
                    <th className="px-5 py-4">نوع الجلسة</th>
                    <th className="px-5 py-4">إجمالي السعر</th>
                    <th className="px-5 py-4">عمولة المنصة ({commissionRate}%)</th>
                    <th className="px-5 py-4">حصة الأخصائي ({100 - commissionRate}%)</th>
                    <th className="px-5 py-4">حالة الحساب والتسوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.map(app => {
                    const appCommission = Math.round(app.price * (commissionRate / 100));
                    const therapistPayout = app.price - appCommission;
                    const isCompleted = app.status === "COMPLETED";

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                          {app.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-800 text-sm">{app.patient.name}</div>
                          <div className="text-xs text-slate-400">{app.patient.email}</div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                          د. {app.therapist.name}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                            {typeIcon[app.type]}
                            {typeLabel[app.type]}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {app.price} ج.م
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-600">
                          {isCompleted ? `${appCommission} ج.م` : "0 ج.م"}
                        </td>
                        <td className="px-5 py-4 font-bold text-indigo-600">
                          {isCompleted ? `${therapistPayout}  ج.م` : "0 ج.م"}
                        </td>
                        <td className="px-5 py-4">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                              ✓ تم التحصيل والتسوية
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                              ✗ مسترجع (حجز ملغي)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                        <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        لا توجد دفعات مالية بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
                type="button"
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
