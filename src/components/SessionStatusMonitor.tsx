"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  User,
  CheckCircle,
  Play,
  StopCircle,
  XCircle,
} from "lucide-react";

interface SessionStatusData {
  appointment: {
    id: string;
    patientName: string;
    therapistName: string;
    scheduledAt: string;
    duration: number;
    status: string;
  };
  sessionStatus: {
    status: string;
    patientJoinedAt?: string;
    therapistJoinedAt?: string;
    sessionStartedAt?: string;
    sessionEndedAt?: string;
  };
  monitoring: {
    phase: string;
    isScheduled: boolean;
    isLate: boolean;
    minutesLate: number;
    minutesUntilStart: number;
    patientJoined: boolean;
    therapistJoined: boolean;
    sessionActive: boolean;
    sessionCompleted: boolean;
  };
  actions: {
    canMarkAsStarted: boolean;
    canMarkAsEnded: boolean;
    canCancel: boolean;
  };
}

interface SessionStatusMonitorProps {
  appointmentId: string;
  onClose?: () => void;
}

export function SessionStatusMonitor({
  appointmentId,
  onClose,
}: SessionStatusMonitorProps) {
  const [data, setData] = useState<SessionStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessionStatus();
    const interval = setInterval(fetchSessionStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [appointmentId]);

  async function fetchSessionStatus() {
    try {
      const res = await fetch(
        `/api/customer-service/session-status?appointmentId=${appointmentId}`
      );
      if (!res.ok) throw new Error("فشل في الحصول على البيانات");

      const responseData = await res.json();
      setData(responseData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/customer-service/session-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          action,
        }),
      });

      if (!res.ok) throw new Error("فشل التحديث");

      await fetchSessionStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="h-6 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
        <AlertCircle size={20} />
        {error || "فشل تحميل بيانات الجلسة"}
      </div>
    );
  }

  const { appointment, sessionStatus, monitoring, actions } = data;
  const isActive = monitoring.sessionActive;
  const isLate = monitoring.isLate;
  const isCompleted = monitoring.sessionCompleted;

  const phaseColors = {
    pending: "bg-slate-50 border-slate-200",
    "should-be-live": "bg-yellow-50 border-yellow-200",
    late: "bg-orange-50 border-orange-200",
    "in-progress": "bg-green-50 border-green-200",
    completed: "bg-blue-50 border-blue-200",
    cancelled: "bg-red-50 border-red-200",
  };

  const phaseLabels = {
    pending: "مجدولة",
    "should-be-live": "يجب أن تكون جارية",
    late: "متأخرة",
    "in-progress": "جارية",
    completed: "مكتملة",
    cancelled: "ملغاة",
  };

  return (
    <div
      className={`border rounded-lg p-6 space-y-4 ${
        phaseColors[monitoring.phase as keyof typeof phaseColors]
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            الجلسة: {appointment.therapistName} ↔️ {appointment.patientName}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {phaseLabels[monitoring.phase as keyof typeof phaseLabels]}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Patient Status */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">المريض</div>
          <div className="text-sm font-bold mt-1">
            {monitoring.patientJoined ? (
              <span className="text-green-600">✅ دخل</span>
            ) : (
              <span className="text-slate-500">⏳ انتظار</span>
            )}
          </div>
        </div>

        {/* Therapist Status */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">الأخصائي</div>
          <div className="text-sm font-bold mt-1">
            {monitoring.therapistJoined ? (
              <span className="text-green-600">✅ دخل</span>
            ) : (
              <span className="text-slate-500">⏳ انتظار</span>
            )}
          </div>
        </div>

        {/* Session Status */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">الجلسة</div>
          <div className="text-sm font-bold mt-1">
            {isActive ? (
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                جارية
              </span>
            ) : isCompleted ? (
              <span className="text-blue-600">✅ مكتملة</span>
            ) : (
              <span className="text-slate-500">⏳ مجدولة</span>
            )}
          </div>
        </div>

        {/* Time Status */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">الوقت</div>
          <div className="text-sm font-bold mt-1">
            {isLate ? (
              <span className="text-orange-600">
                ⚠️ متأخر {monitoring.minutesLate}m
              </span>
            ) : (
              <span className="text-slate-500">
                قبل {monitoring.minutesUntilStart}m
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session Timeline */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">جدول الجلسة</h4>

        <div className="space-y-2 text-sm">
          {/* Scheduled Time */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-slate-600">الموعد المجدول:</span>
            <span className="font-medium">
              {new Date(appointment.scheduledAt).toLocaleString("ar-EG")}
            </span>
          </div>

          {/* Started Time */}
          {sessionStatus.sessionStartedAt && (
            <div className="flex items-center gap-2">
              <Play size={16} className="text-green-500" />
              <span className="text-slate-600">بدأت في:</span>
              <span className="font-medium text-green-600">
                {new Date(sessionStatus.sessionStartedAt).toLocaleTimeString("ar-EG")}
              </span>
            </div>
          )}

          {/* Ended Time */}
          {sessionStatus.sessionEndedAt && (
            <div className="flex items-center gap-2">
              <StopCircle size={16} className="text-blue-500" />
              <span className="text-slate-600">انتهت في:</span>
              <span className="font-medium text-blue-600">
                {new Date(sessionStatus.sessionEndedAt).toLocaleTimeString("ar-EG")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
        <h4 className="font-semibold text-slate-900 text-sm">الإجراءات</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Mark Patient Joined */}
          {actions.canMarkAsStarted && !monitoring.patientJoined && (
            <button
              onClick={() => handleAction("mark-patient-joined")}
              disabled={actionLoading}
              className="flex items-center gap-2 justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition"
            >
              <CheckCircle size={16} />
              دخول المريض
            </button>
          )}

          {/* Mark Therapist Joined */}
          {actions.canMarkAsStarted && !monitoring.therapistJoined && (
            <button
              onClick={() => handleAction("mark-therapist-joined")}
              disabled={actionLoading}
              className="flex items-center gap-2 justify-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition"
            >
              <CheckCircle size={16} />
              دخول الأخصائي
            </button>
          )}

          {/* Start Session */}
          {actions.canMarkAsStarted && !isActive && (
            <button
              onClick={() => handleAction("mark-started")}
              disabled={actionLoading}
              className="flex items-center gap-2 justify-center bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50 transition"
            >
              <Play size={16} />
              بدء الجلسة
            </button>
          )}

          {/* End Session */}
          {actions.canMarkAsEnded && (
            <button
              onClick={() => handleAction("mark-ended")}
              disabled={actionLoading}
              className="flex items-center gap-2 justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50 transition"
            >
              <StopCircle size={16} />
              إنهاء الجلسة
            </button>
          )}

          {/* Cancel */}
          {actions.canCancel && !isCompleted && (
            <button
              onClick={() => handleAction("cancel")}
              disabled={actionLoading}
              className="flex items-center gap-2 justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition"
            >
              <XCircle size={16} />
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      {isLate && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-orange-900">تنبيه التأخير</div>
            <p className="text-sm text-orange-700 mt-1">
              الجلسة متأخرة بـ {monitoring.minutesLate} دقيقة. يُنصح بالتواصل مع الأخصائي
              أو المريض عبر WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
