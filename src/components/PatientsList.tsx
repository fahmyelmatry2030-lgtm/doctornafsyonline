"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Clock, 
  Video, 
  Mic, 
  MessageCircle,
  X, 
  Loader2, 
  Save, 
  Edit3 
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

type Patient = {
  id: string;
  name: string;
  email: string;
  lastSessionDate: string | null;
};

type PatientsListProps = {
  initialPatients: Patient[];
};

type DetailedPatientData = {
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  appointments: Array<{
    id: string;
    scheduledAt: string;
    type: "VIDEO" | "AUDIO" | "CHAT";
    status: string;
    price: number;
    sessionNote: {
      id: string;
      notes: string;
      updatedAt: string;
    } | null;
  }>;
};

const typeIcon = {
  VIDEO: <Video className="w-4 h-4 text-indigo-500" />,
  AUDIO: <Mic className="w-4 h-4 text-teal-500" />,
  CHAT: <MessageCircle className="w-4 h-4 text-purple-500" />,
};

const typeLabel = {
  VIDEO: "فيديو",
  AUDIO: "صوتية",
  CHAT: "شات",
};

const statusLabel: Record<string, { label: string; className: string }> = {
  PENDING: { label: "قيد الانتظار", className: "bg-amber-50 text-amber-700 border border-amber-100" },
  CONFIRMED: { label: "مؤكدة", className: "bg-blue-50 text-blue-700 border border-blue-100" },
  IN_PROGRESS: { label: "جارية الآن", className: "bg-green-50 text-green-700 border border-green-100 animate-pulse" },
  COMPLETED: { label: "مكتملة", className: "bg-slate-100 text-slate-700 border border-slate-200" },
  CANCELLED: { label: "ملغية", className: "bg-red-50 text-red-700 border border-red-100" },
};

export default function PatientsList({ initialPatients }: PatientsListProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<DetailedPatientData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState("");
  const [editedNoteAttachments, setEditedNoteAttachments] = useState<{name: string, url: string}[]>([]);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState("");

  async function handleOpenDetails(patientId: string) {
    setSelectedPatientId(patientId);
    setLoadingDetails(true);
    setError("");
    setPatientData(null);
    setEditingNoteId(null);

    try {
      const res = await fetch(`/api/therapist/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      } else {
        setError("فشل تحميل بيانات المريض");
      }
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoadingDetails(false);
    }
  }

  function handleStartEditNote(appointmentId: string, currentNotes: string) {
    setEditingNoteId(appointmentId);
    let parsedText = currentNotes;
    let parsedAttachments = [];
    try {
      const parsed = JSON.parse(currentNotes);
      if (parsed && typeof parsed === "object" && "text" in parsed) {
        parsedText = parsed.text || "";
        parsedAttachments = parsed.attachments || [];
      }
    } catch {
      // It's just plain text
    }
    setEditedNoteContent(parsedText);
    setEditedNoteAttachments(parsedAttachments);
  }

  async function handleSaveNote(appointmentId: string) {
    setSavingNote(true);
    try {
      const serialized = JSON.stringify({
        text: editedNoteContent,
        attachments: editedNoteAttachments,
      });

      const res = await fetch(`/api/appointments/${appointmentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: serialized }),
      });

      if (res.ok) {
        const updatedNote = await res.json();
        // Update local state
        setPatientData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            appointments: prev.appointments.map((app) => {
              if (app.id === appointmentId) {
                return { ...app, sessionNote: updatedNote };
              }
              return app;
            }),
          };
        });
        setEditingNoteId(null);
      } else {
        alert("فشل حفظ التقرير الطبي");
      }
    } catch {
      alert("حدث خطأ أثناء حفظ التقرير");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAttachFile(appointmentId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFileId(appointmentId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/notes/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setEditedNoteAttachments((prev) => [...prev, { name: result.name, url: result.url }]);
      } else {
        alert(result.error || "فشل رفع الملف المرفق");
      }
    } catch {
      alert("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploadingFileId(null);
      e.target.value = "";
    }
  }

  function handleRemoveAttachment(indexToRemove: number) {
    setEditedNoteAttachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  }

  function renderNoteContent(notesRaw: string) {
    let text = notesRaw;
    let attachments: {name: string, url: string}[] = [];
    try {
      const parsed = JSON.parse(notesRaw);
      if (parsed && typeof parsed === "object" && "text" in parsed) {
        text = parsed.text || "";
        attachments = parsed.attachments || [];
      }
    } catch {
      // Plain text
    }

    return (
      <div className="space-y-4">
        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
        {attachments.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-500 mb-2">الملفات المرفقة:</h4>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {att.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid of Patients */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialPatients.length === 0 ? (
          <div className="col-span-full card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">لا يوجد لديك مرضى مسجلين حتى الآن.</p>
          </div>
        ) : (
          initialPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handleOpenDetails(patient.id)}
              className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-6 bg-white hover:shadow-premium transition-all cursor-pointer group hover:border-indigo-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-white ring-4 ring-indigo-50 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-center text-2xl font-bold text-indigo-600 group-hover:scale-105 transition-transform">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{patient.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{patient.email}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  آخر جلسة: {patient.lastSessionDate ? new Date(patient.lastSessionDate).toLocaleDateString("ar-EG") : "لا يوجد"}
                </span>
                <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform inline-block">
                  عرض السجل ←
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over / Modal for Patient Details & Medical Records */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedPatientId(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800">الملف الطبي للمريض</h2>
                <p className="text-sm text-slate-500">السجل التاريخي والتقارير الطبية للجلسات</p>
              </div>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm text-slate-500">جاري تحميل بيانات السجل...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
              ) : patientData ? (
                <>
                  {/* Patient Info Card */}
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-white ring-4 ring-indigo-50 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-center text-2xl font-black text-indigo-600">
                        {patientData.patient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{patientData.patient.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {patientData.patient.email}
                        </p>
                      </div>
                    </div>
                    {patientData.patient.phone && (
                      <div className="text-sm text-slate-600 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                        <Phone className="w-4 h-4 text-slate-400" /> {patientData.patient.phone}
                      </div>
                    )}
                  </div>

                  {/* Sessions History & Notes */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" /> سجل الجلسات والتقارير الطبية
                    </h3>

                    {patientData.appointments.length === 0 ? (
                      <p className="text-center py-8 text-sm text-slate-400">لا توجد جلسات سابقة مع المريض.</p>
                    ) : (
                      <div className="space-y-6">
                        {patientData.appointments.map((app) => (
                          <div
                            key={app.id}
                            className="border border-slate-100 rounded-2xl p-5 bg-white hover:border-slate-200 transition-colors shadow-sm space-y-4"
                          >
                            {/* Session Title Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold text-slate-800">
                                  {format(new Date(app.scheduledAt), "dd MMMM yyyy · hh:mm a", {
                                    locale: arSA,
                                  })}
                                </span>
                                <span>·</span>
                                <div className="flex items-center gap-1">
                                  {typeIcon[app.type]}
                                  <span>جلسة {typeLabel[app.type]}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  statusLabel[app.status]?.className || ""
                                }`}
                              >
                                {statusLabel[app.status]?.label || app.status}
                              </span>
                            </div>

                            {/* Medical Report / Session Note Section */}
                            {(app.status === "COMPLETED" || app.status === "IN_PROGRESS") && (
                              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-500">التقرير الطبي / ملاحظات الجلسة</span>
                                  {editingNoteId !== app.id ? (
                                    <button
                                      onClick={() => handleStartEditNote(app.id, app.sessionNote?.notes || "")}
                                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      {app.sessionNote?.notes ? "تعديل" : "إضافة تقرير"}
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleSaveNote(app.id)}
                                        disabled={savingNote}
                                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-bold disabled:opacity-50"
                                      >
                                        {savingNote ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Save className="w-3.5 h-3.5" />
                                        )}
                                        حفظ
                                      </button>
                                      <button
                                        onClick={() => setEditingNoteId(null)}
                                        className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                                      >
                                        إلغاء
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {editingNoteId === app.id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      value={editedNoteContent}
                                      onChange={(e) => setEditedNoteContent(e.target.value)}
                                      placeholder="اكتب التقرير الطبي، الملاحظات والتشخيص العلاجي..."
                                      rows={4}
                                      className="w-full text-sm rounded-lg border border-slate-200 bg-white p-3 text-slate-800 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all outline-none resize-none"
                                    ></textarea>
                                    
                                    {/* Attachments Editor */}
                                    <div className="border border-slate-200 rounded-lg p-3 bg-white">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700">الملفات المرفقة بالتقرير</span>
                                        <label className="cursor-pointer">
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleAttachFile(app.id, e)}
                                          />
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition">
                                            {uploadingFileId === app.id ? "جاري الرفع..." : "+ إرفاق ملف"}
                                          </span>
                                        </label>
                                      </div>
                                      
                                      {editedNoteAttachments.length === 0 ? (
                                        <p className="text-[10px] text-slate-400">لا توجد ملفات مرفقة.</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {editedNoteAttachments.map((att, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-md p-2">
                                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 truncate max-w-[200px] flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{att.name}</span>
                                              </a>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(i)}
                                                className="text-slate-400 hover:text-red-500 transition p-1"
                                                title="إزالة الملف"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : app.sessionNote?.notes ? (
                                  renderNoteContent(app.sessionNote.notes)
                                ) : (
                                  <p className="text-slate-400 text-sm italic">
                                    لم يتم كتابة تقرير طبي لهذه الجلسة بعد.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
