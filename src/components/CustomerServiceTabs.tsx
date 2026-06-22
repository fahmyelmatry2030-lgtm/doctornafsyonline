"use client";

import { useState } from "react";
import { SpecialistShiftDashboard } from "@/components/SpecialistShiftDashboard";
import { AvailableAppointmentsPool } from "@/components/AvailableAppointmentsPool";

interface CustomerServiceTabsProps {
  startDate: string;
  endDate: string;
}

export function CustomerServiceTabs({
  startDate,
  endDate,
}: CustomerServiceTabsProps) {
  const [activeTab, setActiveTab] = useState("shift-dashboard");

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("shift-dashboard")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "shift-dashboard"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          🎯 لوحة الفترات
        </button>
        <button
          onClick={() => setActiveTab("available-pool")}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === "available-pool"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          📅 المواعيد المتاحة
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "shift-dashboard" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">
              لوحة تحكم الأخصائيين والفترات
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              عرض جميع الأخصائيين في الفترة المحددة مع جدول جلساتهم الكاملة
            </p>
          </div>

          <SpecialistShiftDashboard
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}

      {activeTab === "available-pool" && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900">
              تجمع المواعيد المتاحة
            </h3>
            <p className="text-sm text-green-700 mt-1">
              البحث عن المواعيد الفارغة للأخصائيين - استخدمها عند الحجز الهاتفي عبر
              WhatsApp أو Facebook
            </p>
          </div>

          <AvailableAppointmentsPool
            onSlotSelect={(slot) => {
              console.log("Selected slot:", slot);
            }}
          />
        </div>
      )}
    </div>
  );
}
