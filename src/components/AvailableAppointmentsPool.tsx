"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, Search } from "lucide-react";

interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
}

interface AvailableAppointmentsPoolProps {
  onSlotSelect?: (slot: AvailableSlot) => void;
}

export function AvailableAppointmentsPool({
  onSlotSelect,
}: AvailableAppointmentsPoolProps) {
  const [therapistId, setTherapistId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [duration, setDuration] = useState(50);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [therapistsList, setTherapistsList] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all specialists to populate the dropdown
    const fetchSpecialists = async () => {
      try {
        const res = await fetch(`/api/customer-service/specialists-sessions?startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json();
        if (data.specialists) {
          setTherapistsList(data.specialists.map((s: any) => ({
            id: s.therapistId,
            name: s.therapistName
          })));
        }
      } catch (err) {
        console.error("Failed to load specialists list:", err);
      }
    };
    fetchSpecialists();
  }, [startDate, endDate]);

  async function handleSearch() {
    if (!therapistId) {
      setError("الرجاء اختيار أخصائي");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAvailableSlots([]);

      const params = new URLSearchParams({
        therapistId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        duration: duration.toString(),
      });

      const res = await fetch(
        `/api/customer-service/available-appointments?${params.toString()}`
      );

      if (!res.ok) throw new Error("فشل في الحصول على البيانات");

      const data = await res.json();
      setAvailableSlots(data.availableSlots || []);

      if (data.availableSlots.length === 0) {
        setSuccessMessage("لا توجد مواعيد فارغة في هذه الفترة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Search size={20} />
          البحث عن المواعيد المتاحة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Therapist ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              الأخصائي
            </label>
            <select
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">اختر الأخصائي (إجباري)</option>
              {therapistsList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              من التاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              إلى التاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              مدة الجلسة (دقيقة)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 دقيقة</option>
              <option value={50}>50 دقيقة</option>
              <option value={60}>60 دقيقة</option>
              <option value={90}>90 دقيقة</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition"
            >
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-2 text-blue-700">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {/* Available Slots Grid */}
      {availableSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            المواعيد المتاحة ({availableSlots.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);

              return (
                <button
                  key={index}
                  onClick={() => onSlotSelect?.(slot)}
                  className="border border-green-300 bg-green-50 rounded-lg p-4 text-right hover:bg-green-100 transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium text-green-600 group-hover:text-green-700">
                      ✅ متاح
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar size={16} />
                      {start.toLocaleDateString("ar-EG")}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Clock size={16} />
                      {start.toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {end.toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="text-xs text-slate-600 pt-2 border-t border-green-200">
                      {slot.duration} دقيقة
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && availableSlots.length === 0 && therapistId && (
        <div className="text-center py-12 text-slate-500">
          <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
          <p>لا توجد مواعيد فارغة في الفترة المحددة</p>
        </div>
      )}
    </div>
  );
}
