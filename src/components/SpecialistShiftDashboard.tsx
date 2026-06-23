"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { ShiftStatsModals } from "./ShiftStatsModals";
import { OnlineStatusIndicator } from "./OnlineStatusIndicator";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  scheduledAt: string;
  duration: number;
  status: string;
  sessionStatus: string;
  sessionStartedAt?: string;
  sessionEndedAt?: string;
  patientJoined: boolean;
  therapistJoined: boolean;
}

interface Specialist {
  therapistId: string;
  therapistName: string;
  isOnline: boolean;
  appointments: Appointment[];
}

export function SpecialistShiftDashboard({
  shiftId,
  startDate,
  endDate,
}: {
  shiftId?: string;
  startDate: string;
  endDate: string;
}) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialistsData();
    const interval = setInterval(fetchSpecialistsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [shiftId, startDate, endDate]);

  async function fetchSpecialistsData() {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      if (shiftId) {
        params.append("shiftId", shiftId);
      }

      const res = await fetch(
        `/api/customer-service/specialists-sessions?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setSpecialists(data.specialists || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertCircle className="inline mr-2" size={20} />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ShiftStatsModals specialists={specialists} />

      <div className="space-y-4">
        {specialists.map((specialist) => (
          <div
            key={specialist.therapistId}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User size={24} />
                {specialist.therapistName}
              </h3>
              <div className="text-blue-100 text-sm mt-1">
                {specialist.appointments.length} جلسة
              </div>
            </div>

            {/* Appointments */}
            <div className="p-6 space-y-3">
              {specialist.appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  لا توجد جلسات مجدولة
                </div>
              ) : (
                specialist.appointments.map((appt) => (
                  <AppointmentRow key={appt.id} appointment={appt} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const scheduledTime = new Date(appointment.scheduledAt);
  const endTime = new Date(
    scheduledTime.getTime() + appointment.duration * 60000
  );

  const isActive = appointment.sessionStatus === "IN_PROGRESS";
  const isCompleted = appointment.sessionStatus === "COMPLETED";

  const statusColor = {
    SCHEDULED: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  }[appointment.sessionStatus];

  const statusLabel = {
    SCHEDULED: "مجدولة",
    IN_PROGRESS: "جارية 🔴",
    COMPLETED: "مكتملة ✅",
    CANCELLED: "ملغاة",
  }[appointment.sessionStatus];

  return (
    <div
      className={`border rounded-lg p-4 ${
        isActive ? "border-green-300 bg-green-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Patient name */}
          <div className="font-semibold text-slate-900">
            المريض: {appointment.patientName}
          </div>

          {/* Time and duration */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {scheduledTime.toLocaleDateString("ar-EG")}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {scheduledTime.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {endTime.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {appointment.duration} دقيقة
            </span>
          </div>

          {/* Participation status */}
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`px-2 py-1 rounded ${
                appointment.patientJoined
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {appointment.patientJoined ? "✅" : "⏳"} المريض
            </span>
            <span
              className={`px-2 py-1 rounded ${
                appointment.therapistJoined
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {appointment.therapistJoined ? "✅" : "⏳"} الأخصائي
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </div>
      </div>

      {/* Timer for active sessions */}
      {isActive && <SessionTimer startedAt={appointment.sessionStartedAt} />}
    </div>
  );
}

function SessionTimer({ startedAt }: { startedAt?: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const start = new Date(startedAt).getTime();
      const now = new Date().getTime();
      setElapsed(Math.round((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-2 text-green-700 font-semibold">
      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
      الجلسة تعمل: {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
