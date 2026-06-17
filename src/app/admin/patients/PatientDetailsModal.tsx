"use client";

import { useState } from "react";
import { 
  Users, Mail, Phone, Calendar, ArrowRight, ShieldAlert,
  User, CheckCircle, Clock, Video, FileText, ChevronDown, ChevronUp, Search, AlertCircle
} from "lucide-react";

type Appointment = {
  id: string;
  scheduledAt: string | Date;
  type: string;
  status: string;
  price: number;
  therapist: {
    name: string;
    email: string;
  };
  sessionNote?: {
    notes: string;
  } | null;
};

type PatientDetailsModalProps = {
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string | Date;
    isSuspended: boolean;
    patientAppointments: Appointment[];
  };
  onClose: () => void;
};

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  
  // Generate short code based on patient ID slice
  const patientCode = `PAT-${patient.id.slice(-6).toUpperCase()}`;

  const toggleNotes = (appointmentId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  const statusLabel: Record<string, string> = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكدة",
    IN_PROGRESS: "جارية الآن",
    COMPLETED: "مكتملة",
    CANCELLED: "ملغية",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-green-50 text-green-700 border-green-200 animate-pulse",
    COMPLETED: "bg-slate-50 text-slate-600 border-slate-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/10">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">{patient.name}</h2>
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider border border-indigo-100">
                  {patientCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">تاريخ التسجيل: {new Date(patient.createdAt).toLocaleDateString("ar-EG")}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm font-bold"
          >
            <ArrowRight className="w-4 h-4" /> إغلاق الملف
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          
          {/* Patient Quick Info Card */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">البريد الإلكتروني</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" /> {patient.email}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">رقم الهاتف</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" /> {patient.phone || "—"}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي الجلسات</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> {patient.patientAppointments.length} جلسة
              </span>
            </div>
          </div>

          {/* Sessions & Reports Timeline */}
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> ملف المريض وسجلات الجلسات المكتملة
            </h3>
            
            {patient.patientAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-bold">لا توجد سجلات جلسات أو تقارير لهذه الحالة حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.patientAppointments.map((app) => {
                  const isCompleted = app.status === "COMPLETED";
                  const hasNote = app.sessionNote && app.sessionNote.notes;
                  const isNoteExpanded = expandedNotes[app.id];

                  return (
                    <div key={app.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Appointment Header */}
                      <div className="p-5 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700">
                            <User className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">الأخصائي المعالج: {app.therapist.name}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>التاريخ: {new Date(app.scheduledAt).toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              <span>•</span>
                              <span>السعر: {app.price} ج.م</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${statusColor[app.status]}`}>
                            {statusLabel[app.status]}
                          </span>
                          {hasNote && (
                            <button
                              onClick={() => toggleNotes(app.id)}
                              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                            >
                              {isNoteExpanded ? (
                                <>إخفاء التقرير <ChevronUp className="w-3.5 h-3.5" /></>
                              ) : (
                                <>عرض تقرير الأخصائي <ChevronDown className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Report Content */}
                      {isNoteExpanded && hasNote && (
                        <div className="p-6 bg-indigo-50/20 border-t border-slate-100/50 animate-slide-down">
                          <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg shrink-0 mt-0.5">
                              <FileText className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <p className="text-xs font-black text-indigo-800">تقرير وتقييم الأخصائي الطبي للحالة:</p>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100/50 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {app.sessionNote?.notes}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
