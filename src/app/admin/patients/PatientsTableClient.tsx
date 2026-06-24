"use client";

import { useState } from "react";
import { Users, Mail, Phone, Calendar, Activity, Ban, CheckCircle, ShieldOff, Search, FileText } from "lucide-react";
import { DeletePatientButton } from "./DeletePatientButton";
import { PatientDetailsModal } from "./PatientDetailsModal";
import { useSearchParams } from "next/navigation";

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

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string | Date;
  isSuspended: boolean;
  patientAppointments: Appointment[];
};

type PatientsTableClientProps = {
  initialPatients: Patient[];
  toggleSuspend: (userId: string, currentStatus: boolean) => Promise<void>;
  deletePatient: (userId: string) => Promise<void>;
  isReadOnly?: boolean;
};

export function PatientsTableClient({ initialPatients, toggleSuspend, deletePatient, isReadOnly = false }: PatientsTableClientProps) {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filter patients by name, email, phone or unique code
  const filteredPatients = patients.filter(p => {
    const code = `PAT-${p.id.slice(-6).toUpperCase()}`;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      (p.phone && p.phone.includes(query)) ||
      code.toLowerCase().includes(query)
    );
  });

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleSuspend(userId, currentStatus);
      setPatients(prev => 
        prev.map(p => p.id === userId ? { ...p, isSuspended: !currentStatus } : p)
      );
      if (selectedPatient && selectedPatient.id === userId) {
        setSelectedPatient(prev => prev ? { ...prev, isSuspended: !currentStatus } : null);
      }
    } catch (err) {
      alert("حدث خطأ أثناء تعديل حالة الحساب");
    }
  };

  const handleDeletePatient = async (userId: string) => {
    try {
      await deletePatient(userId);
      setPatients(prev => prev.filter(p => p.id !== userId));
      if (selectedPatient && selectedPatient.id === userId) {
        setSelectedPatient(null);
      }
    } catch (err) {
      alert("حدث خطأ أثناء حذف الحساب");
    }
  };

  const totalSpend = patients.reduce((sum, p) => sum + p.patientAppointments.reduce((s, a) => s + (a.status === "COMPLETED" ? a.price : 0), 0), 0);
  const activePatients = patients.filter(p => p.patientAppointments.some(a => a.status === "COMPLETED")).length;
  const suspendedPatients = patients.filter(p => p.isSuspended).length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي المرضى", value: patients.length, icon: <Users className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50", suffix: "" },
          { label: "مرضى نشطون", value: activePatients, icon: <Activity className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", suffix: "" },
          { label: "حسابات موقوفة", value: suspendedPatients, icon: <Ban className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50", suffix: "" },
          { label: "إجمالي الإنفاق", value: totalSpend.toLocaleString(), icon: <Calendar className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50", suffix: " ج.م" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-slate-100 p-5 flex items-center gap-4 bg-white shadow-sm">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}{s.suffix}</p>
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
            placeholder="ابحث بالاسم، الكود (PAT-XXXXXX)، الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          يظهر {filteredPatients.length} من أصل {patients.length} مريض
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass rounded-3xl border border-slate-150 overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">المرضى المسجلون</h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{filteredPatients.length} مريض</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">كود الحالة</th>
                <th className="px-5 py-4">المريض</th>
                <th className="px-5 py-4">التواصل</th>
                <th className="px-5 py-4">تاريخ التسجيل</th>
                <th className="px-5 py-4 text-center">الجلسات</th>
                <th className="px-5 py-4 text-center">الإنفاق</th>
                <th className="px-5 py-4 text-center">الحالة</th>
                <th className="px-5 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(p => {
                const spent = p.patientAppointments.reduce((s, a) => s + (a.status === "COMPLETED" ? a.price : 0), 0);
                const code = `PAT-${p.id.slice(-6).toUpperCase()}`;
                const completedSessions = p.patientAppointments.filter(a => a.status === "COMPLETED").length;

                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.isSuspended ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                        {code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${p.isSuspended ? "bg-red-100 text-red-600" : "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600"}`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <button 
                            onClick={() => setSelectedPatient(p)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-right"
                          >
                            {p.name}
                          </button>
                          {p.isSuspended && <span className="mr-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold">موقوف</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" /> {p.email}
                        </span>
                        {p.phone && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {p.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(p.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-black text-slate-700 text-sm">{p.patientAppointments.length}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-bold text-emerald-600">{spent > 0 ? `${spent.toLocaleString()} ج.م` : "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        p.isSuspended
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : completedSessions > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}>
                        {p.isSuspended ? "موقوف" : completedSessions > 0 ? "نشط" : "جديد"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Profile - always visible */}
                        <button
                          onClick={() => setSelectedPatient(p)}
                          title="عرض ملف الحالة بالكامل"
                          className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {/* Action buttons - hidden for ADMIN_VIEWER */}
                        {!isReadOnly && (
                          <>
                            {/* Suspend / Unsuspend */}
                            <button
                              onClick={() => handleToggleSuspend(p.id, p.isSuspended)}
                              title={p.isSuspended ? "رفع الإيقاف" : "إيقاف الحساب"}
                              className={`p-2 rounded-lg transition-colors ${
                                p.isSuspended
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                              }`}
                            >
                              {p.isSuspended ? <CheckCircle className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                            </button>
                            {/* Delete */}
                            <DeletePatientButton
                              patientId={p.id}
                              patientName={p.name}
                              onDelete={handleDeletePatient}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    لا توجد نتائج مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
