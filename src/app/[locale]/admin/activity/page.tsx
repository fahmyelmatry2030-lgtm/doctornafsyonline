"use client";

import { ActivityLog } from "../managers/ActivityLog";
import { LayoutDashboard, Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">مراقبة النشاط</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              متابعة حالة تواجد الموظفين ونشاطهم
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <ActivityLog />
      </div>
    </div>
  );
}
