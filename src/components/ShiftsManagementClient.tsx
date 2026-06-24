"use client";

import { useState } from "react";
import { 
  Plus, Edit2, Trash2, Users, User, Clock, Calendar, 
  AlertCircle, ShieldAlert, Check, X, Search, ChevronRight 
} from "lucide-react";
import { 
  createShift, updateShift, deleteShift, 
  assignSpecialistToShift, removeSpecialistFromShift 
} from "@/app/[locale]/admin/shift-leader/actions";

interface ShiftData {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  description: string | null;
  isActive: boolean;
  shiftLeaderId: string | null;
  shiftLeader: {
    id: string;
    name: string;
    email: string;
  } | null;
  specialistAssignments: Array<{
    therapist: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Props {
  initialShifts: ShiftData[];
  shiftLeaders: UserData[];
  specialists: UserData[];
  isReadOnly: boolean;
  currentUserRole: string;
}

const DAYS_ARABIC: Record<string, string> = {
  SUNDAY: "الأحد",
  MONDAY: "الاثنين",
  TUESDAY: "الثلاثاء",
  WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس",
  FRIDAY: "الجمعة",
  SATURDAY: "السبت",
};

const DAYS_LIST = [
  { value: "SUNDAY", label: "الأحد" },
  { value: "MONDAY", label: "الاثنين" },
  { value: "TUESDAY", label: "الثلاثاء" },
  { value: "WEDNESDAY", label: "الأربعاء" },
  { value: "THURSDAY", label: "الخميس" },
  { value: "FRIDAY", label: "الجمعة" },
  { value: "SATURDAY", label: "السبت" },
];

export function ShiftsManagementClient({ 
  initialShifts, 
  shiftLeaders, 
  specialists, 
  isReadOnly,
  currentUserRole
}: Props) {
  const [shifts, setShifts] = useState<ShiftData[]>(initialShifts);
  const [selectedShift, setSelectedShift] = useState<ShiftData | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showSpecialistsModal, setShowSpecialistsModal] = useState(false);
  
  // Shift Form state
  const [isEditMode, setIsEditMode] = useState(false);
  const [shiftName, setShiftName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("SUNDAY");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [description, setDescription] = useState("");
  const [shiftLeaderId, setShiftLeaderId] = useState("");

  // Specialists Filter state
  const [specSearch, setSpecSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerMessage = (type: "error" | "success", msg: string) => {
    if (type === "error") {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedShift(null);
    setShiftName("");
    setDayOfWeek("SUNDAY");
    setStartTime("08:00");
    setEndTime("16:00");
    setDescription("");
    setShiftLeaderId("");
    setErrorMsg(null);
    setShowShiftModal(true);
  };

  const handleOpenEditModal = (shift: ShiftData) => {
    setIsEditMode(true);
    setSelectedShift(shift);
    setShiftName(shift.name);
    setDayOfWeek(shift.dayOfWeek);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setDescription(shift.description || "");
    setShiftLeaderId(shift.shiftLeaderId || "");
    setErrorMsg(null);
    setShowShiftModal(true);
  };

  const handleOpenSpecialistsModal = (shift: ShiftData) => {
    setSelectedShift(shift);
    setSpecSearch("");
    setErrorMsg(null);
    setShowSpecialistsModal(true);
  };

  const handleSaveShift = async () => {
    if (!shiftName || !startTime || !endTime) {
      triggerMessage("error", "الرجاء ملء الحقول المطلوبة (اسم الفترة، وقت البدء، وقت الانتهاء)");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        name: shiftName,
        dayOfWeek,
        startTime,
        endTime,
        description,
        shiftLeaderId: shiftLeaderId || null,
      };

      if (isEditMode && selectedShift) {
        const res = await updateShift(selectedShift.id, payload);
        if (!res.success) throw new Error(res.error);
        
        const updatedLeader = shiftLeaders.find(l => l.id === shiftLeaderId) || null;
        setShifts(prev => prev.map(s => s.id === selectedShift.id ? {
          ...s,
          ...payload,
          shiftLeader: updatedLeader,
        } : s));
        
        triggerMessage("success", "تم تحديث الشيفت بنجاح");
      } else {
        const res = await createShift(payload);
        if (!res.success) throw new Error(res.error);
        
        const newLeader = shiftLeaders.find(l => l.id === shiftLeaderId) || null;
        const newShift: ShiftData = {
          ...res.shift!,
          shiftLeader: newLeader,
          specialistAssignments: [],
        };
        setShifts(prev => [...prev, newShift]);
        triggerMessage("success", "تم إنشاء الشيفت بنجاح");
      }

      setShowShiftModal(false);
    } catch (err: any) {
      triggerMessage("error", err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الشيفت بالكامل؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    try {
      setLoading(true);
      const res = await deleteShift(shiftId);
      if (!res.success) throw new Error(res.error);
      
      setShifts(prev => prev.filter(s => s.id !== shiftId));
      triggerMessage("success", "تم حذف الشيفت بنجاح");
    } catch (err: any) {
      triggerMessage("error", err.message || "فشل حذف الشيفت");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialist = async (therapistId: string) => {
    if (!selectedShift) return;

    try {
      setLoading(true);
      const res = await assignSpecialistToShift(selectedShift.id, therapistId);
      if (!res.success) throw new Error(res.error);

      const specialist = specialists.find(s => s.id === therapistId)!;
      
      // Update local shifts state
      setShifts(prev => prev.map(s => {
        if (s.id === selectedShift.id) {
          // Check if already in the list to avoid duplicate render
          const alreadyAssigned = s.specialistAssignments.some(a => a.therapist.id === therapistId);
          if (alreadyAssigned) return s;
          return {
            ...s,
            specialistAssignments: [...s.specialistAssignments, { therapist: specialist }]
          };
        }
        return s;
      }));

      // Update selectedShift details in modal view
      setSelectedShift(prev => {
        if (!prev) return null;
        const alreadyAssigned = prev.specialistAssignments.some(a => a.therapist.id === therapistId);
        if (alreadyAssigned) return prev;
        return {
          ...prev,
          specialistAssignments: [...prev.specialistAssignments, { therapist: specialist }]
        };
      });

      triggerMessage("success", "تم إضافة الأخصائي بنجاح للشيفت");
    } catch (err: any) {
      triggerMessage("error", err.message || "فشل إضافة الأخصائي");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSpecialist = async (therapistId: string) => {
    if (!selectedShift) return;

    try {
      setLoading(true);
      const res = await removeSpecialistFromShift(selectedShift.id, therapistId);
      if (!res.success) throw new Error(res.error);

      // Update local shifts state
      setShifts(prev => prev.map(s => {
        if (s.id === selectedShift.id) {
          return {
            ...s,
            specialistAssignments: s.specialistAssignments.filter(a => a.therapist.id !== therapistId)
          };
        }
        return s;
      }));

      // Update selectedShift details in modal view
      setSelectedShift(prev => {
        if (!prev) return null;
        return {
          ...prev,
          specialistAssignments: prev.specialistAssignments.filter(a => a.therapist.id !== therapistId)
        };
      });

      triggerMessage("success", "تم إزالة الأخصائي من الشيفت");
    } catch (err: any) {
      triggerMessage("error", err.message || "فشل إزالة الأخصائي");
    } finally {
      setLoading(false);
    }
  };

  // Filter specialists for listing in drop down inside modal
  const unassignedSpecialists = specialists.filter(spec => {
    if (!selectedShift) return false;
    const isAssigned = selectedShift.specialistAssignments.some(a => a.therapist.id === spec.id);
    const matchesSearch = spec.name.toLowerCase().includes(specSearch.toLowerCase()) || 
                          spec.email.toLowerCase().includes(specSearch.toLowerCase());
    return !isAssigned && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
          <Check size={20} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-[#2B3674]">لوحة إدارة فترات العمل (Shifts)</h2>
          <p className="text-sm text-slate-400 mt-1">تحديد توقيت الشيفتات، وتعيين قادة الفترات، وإضافة أخصائيين لكل فترة عمل.</p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-3 bg-[#4318FF] hover:bg-[#2B12D3] text-white font-bold rounded-2xl transition shadow-md shadow-indigo-500/10 text-sm"
          >
            <Plus size={18} />
            إنشاء فترة عمل جديدة
          </button>
        )}
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#A3AED0] mb-1">إجمالي الفترات النشطة</p>
            <p className="text-2xl font-black text-[#2B3674]">{shifts.length} فترات</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#A3AED0] mb-1">إجمالي الأخصائيين المعينين</p>
            <p className="text-2xl font-black text-[#2B3674]">
              {shifts.reduce((sum, s) => sum + s.specialistAssignments.length, 0)} أخصائي
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#A3AED0] mb-1">فترات بدون قادة شيفت</p>
            <p className="text-2xl font-black text-rose-600">
              {shifts.filter(s => !s.shiftLeaderId).length} فترات
            </p>
          </div>
        </div>
      </div>

      {/* Shifts List Grid */}
      {shifts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[24px] p-12 text-center text-slate-500">
          <Calendar className="mx-auto w-12 h-12 text-slate-355 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد فترات عمل مضافة</h3>
          <p className="text-sm mt-1">ابدأ بإنشاء فترة عمل جديدة وتعيين المسؤولين لها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {shifts.map((shift) => (
            <div key={shift.id} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition relative flex flex-col justify-between">
              <div>
                {/* Top Title and Day */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 mb-2">
                      شيفت يوم {DAYS_ARABIC[shift.dayOfWeek] || shift.dayOfWeek}
                    </span>
                    <h4 className="text-lg font-black text-[#2B3674]">{shift.name}</h4>
                  </div>
                  
                  {/* Action Buttons */}
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(shift)}
                        className="p-2 bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-xl transition hover:bg-indigo-50"
                        title="تعديل تفاصيل الشيفت"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {currentUserRole === "ADMIN" && (
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="p-2 bg-slate-50 text-slate-600 hover:text-red-650 rounded-xl transition hover:bg-rose-50"
                          title="حذف الشيفت"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Shift Timings */}
                <div className="flex gap-6 text-sm text-slate-600 mb-5 bg-[#F4F7FE] p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 font-semibold text-[#2B3674]">
                    <Clock size={16} className="text-slate-400" />
                    <span>البدء: {shift.startTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#2B3674]">
                    <Clock size={16} className="text-slate-400" />
                    <span>الانتهاء: {shift.endTime}</span>
                  </div>
                </div>

                {/* Leader Section */}
                <div className="mb-5 space-y-2">
                  <h5 className="text-xs font-bold text-slate-400">قائد الشيفت المسؤول:</h5>
                  {shift.shiftLeader ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {shift.shiftLeader.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2B3674] truncate">{shift.shiftLeader.name}</p>
                        <p className="text-xs text-slate-400 truncate">{shift.shiftLeader.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-dashed border-amber-200 text-amber-800 rounded-2xl text-xs font-bold">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                      لا يوجد قائد شيفت معين لهذه الفترة حالياً.
                    </div>
                  )}
                </div>

                {/* Description */}
                {shift.description && (
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed bg-slate-50/40 p-2.5 rounded-xl border border-slate-50">
                    {shift.description}
                  </p>
                )}
              </div>

              {/* Specialists list */}
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#2B3674]">الأخصائيين المعينين ({shift.specialistAssignments.length})</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleOpenSpecialistsModal(shift)}
                      className="text-xs font-bold text-[#4318FF] hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg"
                    >
                      إدارة الأخصائيين
                    </button>
                  )}
                </div>
                {shift.specialistAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">لا يوجد أخصائيين مضافين لهذا الشيفت بعد.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {shift.specialistAssignments.map((assignment) => (
                      <span 
                        key={assignment.therapist.id} 
                        className="inline-flex items-center text-xs font-bold bg-[#F4F7FE] text-[#2B3674] px-2.5 py-1 rounded-xl border border-slate-100"
                      >
                        {assignment.therapist.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift Form Modal (Create or Edit) */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#2B3674]">
                {isEditMode ? "تعديل تفاصيل فترة العمل" : "إنشاء فترة عمل جديدة"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">يرجى تحديد أوقات ومسؤولي الشيفت.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">اسم فترة العمل</label>
                <input
                  type="text"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  placeholder="مثال: الفترة الصباحية، فترة الطوارئ"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">من الساعة (وقت البدء)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">إلى الساعة (الانتهاء)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">يوم العمل</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                  >
                    {DAYS_LIST.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">قائد الشيفت</label>
                  <select
                    value={shiftLeaderId}
                    onChange={(e) => setShiftLeaderId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors"
                  >
                    <option value="">-- بدون قائد معين --</option>
                    {shiftLeaders.map((leader) => (
                      <option key={leader.id} value={leader.id}>{leader.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">ملاحظات أو وصف للشيفت</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف اختياري عن الشيفت والمهام المطلوبة..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowShiftModal(false)}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition text-sm font-bold disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveShift}
                disabled={loading}
                className="px-5 py-2.5 bg-[#4318FF] hover:bg-[#2B12D3] text-white rounded-2xl transition text-sm font-bold disabled:opacity-50 shadow-md shadow-indigo-500/10"
              >
                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Specialists Modal */}
      {showSpecialistsModal && selectedShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-100 flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-xl font-black text-[#2B3674]">إدارة أخصائيي الشيفت</h3>
              <p className="text-xs text-slate-400 mt-1">شيفت: {selectedShift.name} — يوم {DAYS_ARABIC[selectedShift.dayOfWeek]}</p>
            </div>

            {/* Added Specialists list */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
              <div>
                <h5 className="text-xs font-bold text-slate-400 mb-2">الأخصائيين المعينين حالياً ({selectedShift.specialistAssignments.length}):</h5>
                {selectedShift.specialistAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">لا يوجد أخصائيين في هذا الشيفت حالياً.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {selectedShift.specialistAssignments.map((a) => (
                      <div key={a.therapist.id} className="flex justify-between items-center p-3 bg-white hover:bg-slate-50">
                        <div>
                          <p className="text-xs font-bold text-[#2B3674]">{a.therapist.name}</p>
                          <p className="text-[10px] text-slate-400">{a.therapist.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSpecialist(a.therapist.id)}
                          disabled={loading}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="إزالة من الشيفت"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add new Specialists form */}
              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold text-[#2B3674] mb-3">تعيين أخصائيين إضافيين:</h5>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="ابحث عن أخصائي بالاسم..."
                    value={specSearch}
                    onChange={(e) => setSpecSearch(e.target.value)}
                    className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 outline-none text-xs focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {unassignedSpecialists.length === 0 ? (
                    <p className="text-xs text-slate-450 p-4 text-center italic">لا يوجد أخصائيين متاحين للتعيين.</p>
                  ) : (
                    unassignedSpecialists.map((spec) => (
                      <div key={spec.id} className="flex justify-between items-center p-3 bg-white hover:bg-slate-50">
                        <div>
                          <p className="text-xs font-bold text-[#2B3674]">{spec.name}</p>
                          <p className="text-[10px] text-slate-400">{spec.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddSpecialist(spec.id)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4318FF] font-bold rounded-xl transition text-[10px]"
                        >
                          <Plus className="w-3 h-3" /> تعيين
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSpecialistsModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition text-sm font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
