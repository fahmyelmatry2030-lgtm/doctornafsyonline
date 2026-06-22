"use client";

import { useState } from "react";
import { X, Edit2, Trash2 } from "lucide-react";

interface SpecialistData {
  therapistId: string;
  therapistName: string;
  appointments: any[];
}

export function ShiftStatsModals({
  specialists,
}: {
  specialists: SpecialistData[];
}) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const totalSessions = specialists.reduce(
    (acc, s) => acc + s.appointments.length,
    0
  );

  const runningSessions = specialists.reduce(
    (acc, s) =>
      acc +
      s.appointments.filter((a) => a.sessionStatus === "IN_PROGRESS").length,
    0
  );

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Specialists Card - Clickable */}
        <button
          onClick={() => setOpenModal("specialists")}
          className="group bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <div className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
            عدد الأخصائيين
          </div>
          <div className="text-3xl font-bold text-blue-900 mt-2 group-hover:text-blue-600">
            {specialists.length}
          </div>
          <p className="text-xs text-blue-500 mt-1">اضغط لعرض التفاصيل</p>
        </button>

        {/* Total Sessions Card - Clickable */}
        <button
          onClick={() => setOpenModal("sessions")}
          className="group bg-green-50 border-2 border-green-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <div className="text-sm text-green-600 font-medium group-hover:text-green-700">
            إجمالي الجلسات
          </div>
          <div className="text-3xl font-bold text-green-900 mt-2 group-hover:text-green-600">
            {totalSessions}
          </div>
          <p className="text-xs text-green-500 mt-1">اضغط لعرض التفاصيل</p>
        </button>

        {/* Running Sessions Card - Clickable */}
        <button
          onClick={() => setOpenModal("running")}
          className="group bg-purple-50 border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <div className="text-sm text-purple-600 font-medium group-hover:text-purple-700">
            الجلسات الجارية
          </div>
          <div className="text-3xl font-bold text-purple-900 mt-2 group-hover:text-purple-600">
            {runningSessions}
          </div>
          <p className="text-xs text-purple-500 mt-1">اضغط لعرض التفاصيل</p>
        </button>
      </div>

      {/* Specialists Modal */}
      {openModal === "specialists" && (
        <SimpleModal
          title="قائمة الأخصائيين"
          onClose={() => setOpenModal(null)}
        >
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {specialists.length > 0 ? (
              specialists.map((specialist) => (
                <div
                  key={specialist.therapistId}
                  className="border rounded-lg p-3 hover:bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {specialist.therapistName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {specialist.appointments.length} جلسة
                    </p>
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
              <p className="text-center text-slate-500 py-8">لا توجد بيانات</p>
            )}
          </div>
        </SimpleModal>
      )}

      {/* Sessions Modal */}
      {openModal === "sessions" && (
        <SimpleModal
          title="قائمة الجلسات"
          onClose={() => setOpenModal(null)}
        >
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {specialists.flatMap((specialist) =>
              specialist.appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="border rounded-lg p-3 hover:bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {appt.patientName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      الأخصائي: {specialist.therapistName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(appt.scheduledAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      appt.sessionStatus === "IN_PROGRESS"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {appt.sessionStatus === "IN_PROGRESS"
                      ? "جارية 🔴"
                      : "مجدولة"}
                  </span>
                </div>
              ))
            )}
          </div>
        </SimpleModal>
      )}

      {/* Running Sessions Modal */}
      {openModal === "running" && (
        <SimpleModal
          title="الجلسات الجارية"
          onClose={() => setOpenModal(null)}
        >
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {specialists
              .flatMap((specialist) =>
                specialist.appointments.map((appt) => ({
                  ...appt,
                  specialistName: specialist.therapistName,
                }))
              )
              .filter((appt) => appt.sessionStatus === "IN_PROGRESS")
              .length > 0 ? (
              specialists
                .flatMap((specialist) =>
                  specialist.appointments.map((appt) => ({
                    ...appt,
                    specialistName: specialist.therapistName,
                  }))
                )
                .filter((appt) => appt.sessionStatus === "IN_PROGRESS")
                .map((appt) => (
                  <div
                    key={appt.id}
                    className="border-2 border-green-300 rounded-lg p-3 bg-green-50 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {appt.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        الأخصائي: {appt.specialistName}
                      </p>
                      <p className="text-xs text-green-600 font-semibold">
                        🔴 جارية الآن
                      </p>
                    </div>
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition">
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                لا توجد جلسات جارية
              </p>
            )}
          </div>
        </SimpleModal>
      )}
    </>
  );
}

function SimpleModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
