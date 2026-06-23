"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, Clock, X, Plus, Edit2, Trash2, Loader } from "lucide-react";

interface Specialist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  shiftsCount?: number;
}

interface Session {
  id: string;
  appointmentId: string;
  patientName?: string;
  therapistName?: string;
  status: string;
  startTime?: string;
  endTime?: string;
}

interface AvailableSlot {
  id: string;
  therapistId: string;
  therapistName?: string;
  slotStartTime: string;
  slotEndTime: string;
  duration: number;
  isBooked: boolean;
}

interface Modal {
  specialists: boolean;
  sessions: boolean;
  slots: boolean;
}

export function CustomerServiceDashboard({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [modals, setModals] = useState<Modal>({
    specialists: false,
    sessions: false,
    slots: false,
  });

  const [data, setData] = useState({
    specialists: [] as Specialist[],
    sessions: [] as Session[],
    slots: [] as AvailableSlot[],
  });

  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    specialists: 0,
    sessions: 0,
    slots: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, [startDate, endDate]);

  const fetchCounts = async () => {
    try {
      // Fetch specialists and sessions
      const specialistsRes = await fetch(
        `/api/customer-service/specialists-sessions?startDate=${startDate}&endDate=${endDate}`
      );
      const specialistsData = await specialistsRes.json();

      // Fetch available slots
      const slotsRes = await fetch(
        `/api/customer-service/available-appointments?startDate=${startDate}&endDate=${endDate}`
      );
      const slotsData = await slotsRes.json();

      setCounts({
        specialists: specialistsData.specialistsCount || 0,
        sessions: specialistsData.appointmentsCount || 0,
        slots: slotsData.totalSlots || 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const openModal = async (modalType: keyof Modal) => {
    setModals((prev) => ({ ...prev, [modalType]: true }));
    setLoading(true);

    try {
      if (modalType === "specialists") {
        const res = await fetch(
          `/api/customer-service/specialists-sessions?startDate=${startDate}&endDate=${endDate}`
        );
        const resJson = await res.json();
        const specialistsList = (resJson.specialists || []).map((spec: any) => ({
          id: spec.therapistId,
          name: spec.therapistName,
          email: spec.email || `${spec.therapistId}@doctornafsyonline.com`,
          phone: spec.phone || "",
          shiftsCount: spec.appointments?.length || 0,
        }));
        setData((prev) => ({ ...prev, specialists: specialistsList }));
      } else if (modalType === "sessions") {
        const res = await fetch(
          `/api/customer-service/specialists-sessions?startDate=${startDate}&endDate=${endDate}`
        );
        const allData = await res.json();
        const sessions = (allData.specialists || []).flatMap((spec: any) =>
          (spec.appointments || []).map((apt: any) => ({
            id: apt.id,
            appointmentId: apt.id,
            patientName: apt.patientName || "غير معروف",
            therapistName: spec.therapistName,
            status: apt.status || "SCHEDULED",
            startTime: apt.scheduledAt || new Date().toISOString(),
          }))
        );
        setData((prev) => ({ ...prev, sessions }));
      } else if (modalType === "slots") {
        const res = await fetch(
          `/api/customer-service/available-appointments?startDate=${startDate}&endDate=${endDate}`
        );
        const slotsData = await res.json();
        const slotsList = (slotsData.availableSlots || []).map((slot: any, idx: number) => ({
          id: `${slot.therapistId}-${idx}`,
          therapistId: slot.therapistId,
          therapistName: slot.therapistName || "أخصائي نفسي",
          slotStartTime: slot.startTime,
          slotEndTime: slot.endTime,
          duration: slot.duration,
          isBooked: !slot.available,
        }));
        setData((prev) => ({ ...prev, slots: slotsList }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = (modalType: keyof Modal) => {
    setModals((prev) => ({ ...prev, [modalType]: false }));
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Specialists Card */}
        <button
          onClick={() => openModal("specialists")}
          className="group bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer text-left"
        >
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2 group-hover:text-blue-600">
            <Users size={16} />
            الأخصائيين
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 group-hover:text-blue-600">
            {counts.specialists}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            اضغط لعرض التفاصيل
          </p>
        </button>

        {/* Sessions Card */}
        <button
          onClick={() => openModal("sessions")}
          className="group bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer text-left"
        >
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2 group-hover:text-emerald-600">
            <Calendar size={16} />
            الجلسات اليوم
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 group-hover:text-emerald-600">
            {counts.sessions}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            اضغط لعرض التفاصيل
          </p>
        </button>

        {/* Available Slots Card */}
        <button
          onClick={() => openModal("slots")}
          className="group bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer text-left"
        >
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2 group-hover:text-amber-600">
            <Clock size={16} />
            المتاحة
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 group-hover:text-amber-600">
            {counts.slots}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            اضغط لعرض التفاصيل
          </p>
        </button>
      </div>

      {/* Specialists Modal */}
      {modals.specialists && (
        <Modal
          title="قائمة الأخصائيين"
          isOpen={modals.specialists}
          onClose={() => closeModal("specialists")}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-blue-500" size={24} />
              </div>
            ) : data.specialists.length > 0 ? (
              data.specialists.map((specialist) => (
                <div
                  key={specialist.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {specialist.name}
                    </h4>
                    <p className="text-xs text-slate-500">{specialist.email}</p>
                    {specialist.phone && (
                      <p className="text-xs text-slate-500">
                        {specialist.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition">
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                لا توجد بيانات
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Sessions Modal */}
      {modals.sessions && (
        <Modal
          title="قائمة الجلسات"
          isOpen={modals.sessions}
          onClose={() => closeModal("sessions")}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-emerald-500" size={24} />
              </div>
            ) : data.sessions.length > 0 ? (
              data.sessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {session.patientName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      الأخصائي: {session.therapistName}
                    </p>
                    <p className="text-xs text-slate-500">
                      الحالة:{" "}
                      <span
                        className={`font-semibold ${
                          session.status === "IN_PROGRESS"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {session.status}
                      </span>
                    </p>
                  </div>
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition">
                    <Edit2 size={16} className="text-blue-600" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                لا توجد جلسات
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Available Slots Modal */}
      {modals.slots && (
        <Modal
          title="المواعيد المتاحة"
          isOpen={modals.slots}
          onClose={() => closeModal("slots")}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-amber-500" size={24} />
              </div>
            ) : data.slots.length > 0 ? (
              data.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {slot.therapistName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {new Date(slot.slotStartTime).toLocaleString("ar-EG")}
                    </p>
                    <p className="text-xs text-slate-500">
                      المدة: {slot.duration} دقيقة
                    </p>
                    <span
                      className={`inline-block text-xs font-semibold mt-1 px-2 py-1 rounded ${
                        slot.isBooked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {slot.isBooked ? "محجوز" : "متاح"}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition">
                    <Plus size={16} className="text-blue-600" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                لا توجد مواعيد متاحة
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
