"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, PrinterIcon, Download } from "lucide-react";

interface ShiftLeaderSession {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  sessionStatus: string;
  patientJoined: boolean;
  therapistJoined: boolean;
  amount: number;
}

interface ShiftLeaderTeam {
  specialistId: string;
  specialistName: string;
  isOnline: boolean;
  appointmentsToday: number;
  totalEarnings: number;
  commissionEarnings: number;
  sessions: ShiftLeaderSession[];
}

interface ShiftLeaderStats {
  totalSpecialists: number;
  onlineSpecialists: number;
  totalSessions: number;
  totalEarnings: number;
  totalCommissions: number;
  team: ShiftLeaderTeam[];
  assignedShift?: {
    id: string;
    name: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    description?: string | null;
    isActive: boolean;
  } | null;
}

export function ShiftLeaderDashboard() {
  const [stats, setStats] = useState<ShiftLeaderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<ShiftLeaderTeam | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [reportType, setReportType] = useState<"summary" | "specialists" | "patients">("summary");

  useEffect(() => {
    fetchShiftLeaderData();
    const interval = setInterval(fetchShiftLeaderData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchShiftLeaderData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/admin/shift-leader", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || "فشل تحميل البيانات");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "فشل تحميل البيانات");
      }

      setStats({
        totalSpecialists: data.totalSpecialists,
        onlineSpecialists: data.onlineSpecialists,
        totalSessions: data.totalSessions,
        totalEarnings: data.totalEarnings,
        totalCommissions: data.totalCommissions,
        team: data.team,
        assignedShift: data.assignedShift || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      console.error("Error fetching data:", error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialistStatus = async () => {
    if (!selectedSpecialist) return;
    
    try {
      setTogglingStatus(true);
      const newStatus = !selectedSpecialist.isOnline;

      const response = await fetch("/api/admin/specialist-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          specialistId: selectedSpecialist.specialistId,
          isOnline: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل تحديث الحالة");
      }

      // تحديث الحالة المحلية
      setSelectedSpecialist({
        ...selectedSpecialist,
        isOnline: newStatus,
      });

      // تحديث إحصائيات النافذة الرئيسية
      await fetchShiftLeaderData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      console.error("Error toggling status:", error);
      setErrorMessage(message);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !stats) return;

    const printDate = new Date().toLocaleDateString("ar-EG");
    const printTime = new Date().toLocaleTimeString("ar-EG");

    let html = "";
    if (reportType === "summary") {
      html = generateSummaryReport(stats, printDate, printTime);
    } else if (reportType === "specialists") {
      html = generateSpecialistsReport(stats, printDate, printTime);
    } else {
      html = generatePatientsReport(stats, printDate, printTime);
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  function generateSummaryReport(stats: ShiftLeaderStats, date: string, time: string) {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ملخص القيادة</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
          .stat-box { border: 2px solid #0066cc; padding: 12px; border-radius: 6px; text-align: center; background: #f8f9ff; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0066cc; color: white; padding: 12px; text-align: right; }
          td { padding: 10px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .online { color: #22aa22; font-weight: bold; }
          .offline { color: #cc2222; font-weight: bold; }
          .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #0066cc; border-bottom: 2px solid #0066cc; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير ملخص القيادة - الشيفت</h1>
          <div class="print-info">التاريخ: ${date} | الوقت: ${time}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${stats.onlineSpecialists}</div>
            <div class="stat-label">🟢 أونلاين الآن</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.totalSpecialists}</div>
            <div class="stat-label">📊 إجمالي الأخصائيين</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.totalSessions}</div>
            <div class="stat-label">📞 إجمالي الجلسات</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.totalCommissions}</div>
            <div class="stat-label">💰 عمولتك (ج.م)</div>
          </div>
        </div>

        <div class="section-title">ملخص الأخصائيين</div>
        <table>
          <tr>
            <th>الحالة</th>
            <th>الجلسات</th>
            <th>العمولة (ج.م)</th>
            <th>الاسم</th>
          </tr>
          ${stats.team.map(specialist => `
            <tr>
              <td><span class="${specialist.isOnline ? 'online' : 'offline'}">${specialist.isOnline ? '🟢 أونلاين' : '🔴 أوفلاين'}</span></td>
              <td>${specialist.appointmentsToday}</td>
              <td>${specialist.commissionEarnings}</td>
              <td><strong>${specialist.specialistName}</strong></td>
            </tr>
          `).join('')}
        </table>
        <div class="footer"><p>© تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `;
  }

  function generateSpecialistsReport(stats: ShiftLeaderStats, date: string, time: string) {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الأخصائيين التفصيلي</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          .specialist-section { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 6px; background: #fafafa; }
          .specialist-name { font-size: 16px; font-weight: bold; color: #0066cc; margin-bottom: 10px; }
          .status { padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 10px; }
          .online { background: #d4edda; color: #155724; }
          .offline { background: #f8d7da; color: #721c24; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
          th { background: #0066cc; color: white; padding: 8px; text-align: right; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #fff; }
          h3 { margin: 15px 0 10px 0; color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; font-size: 13px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الأخصائيين التفصيلي</h1>
          <div class="print-info">التاريخ: ${date} | الوقت: ${time}</div>
        </div>

        ${stats.team.map(specialist => `
          <div class="specialist-section">
            <div class="specialist-name">${specialist.specialistName}</div>
            <span class="status ${specialist.isOnline ? 'online' : 'offline'}">
              ${specialist.isOnline ? '🟢 أونلاين' : '🔴 أوفلاين'}
            </span>
            
            <table>
              <tr><th>البيان</th><th>القيمة</th></tr>
              <tr><td>الجلسات اليوم</td><td><strong>${specialist.appointmentsToday}</strong></td></tr>
              <tr><td>عمولتك (ج.م)</td><td><strong>${specialist.commissionEarnings}</strong></td></tr>
            </table>
            
            ${specialist.sessions.length > 0 ? `
              <h3>جلسات اليوم (${specialist.sessions.length})</h3>
              <table>
                <tr><th>المريض</th><th>الوقت</th><th>الحالة</th></tr>
                ${specialist.sessions.map(s => `
                  <tr>
                    <td>${s.patientName}</td>
                    <td>${new Date(s.scheduledAt).toLocaleTimeString("ar-EG", {hour:"2-digit", minute:"2-digit"})}</td>
                    <td>${s.sessionStatus}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p style="color: #999; margin: 10px 0;">لا توجد جلسات</p>'}
          </div>
        `).join('')}

        <div class="footer"><p>© تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `;
  }

  function generatePatientsReport(stats: ShiftLeaderStats, date: string, time: string) {
    const allSessions = stats.team.flatMap(specialist => 
      specialist.sessions.map(session => ({
        ...session,
        specialistName: specialist.specialistName,
      }))
    );

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير المرضى والجلسات</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0066cc; color: white; padding: 12px; text-align: right; font-weight: bold; font-size: 13px; }
          td { padding: 10px; border: 1px solid #ddd; font-size: 12px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المرضى والجلسات الشامل</h1>
          <div class="print-info">التاريخ: ${date} | الوقت: ${time} | إجمالي الجلسات: ${allSessions.length}</div>
        </div>

        <table>
          <tr>
            <th>الأخصائي</th>
            <th>المريض</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>الوقت</th>
            <th>الحالة</th>
          </tr>
          ${allSessions.map(session => `
            <tr>
              <td>${session.specialistName}</td>
              <td>${session.patientName}</td>
              <td>${session.patientEmail}</td>
              <td>${session.patientPhone || '-'}</td>
              <td>${new Date(session.scheduledAt).toLocaleString("ar-EG", {month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"})}</td>
              <td>${session.sessionStatus}</td>
            </tr>
          `).join('')}
        </table>

        <div class="footer"><p>© تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `;
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!stats) {
    return <div className="text-red-600">خطأ في تحميل البيانات</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Banner */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-slate-100">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="z-10">
          <h1 className="text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2">
            لوحة تحكم قائد الشيفت 📊
          </h1>
          <p className="text-[#A3AED0] font-medium text-sm max-w-lg">
            تابع أداء الفريق، الحالة اليومية للأخصائيين، وتقارير الشيفت من لوحة تحكم واحدة مُنسقة مثل لوحة الأدمين.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 z-10">
          <div className="bg-[#F4F7FE] px-5 py-3 rounded-2xl">
            <p className="text-xs text-[#A3AED0] font-bold mb-1">تاريخ اليوم</p>
            <p className="text-sm font-black text-[#2B3674]">
              {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Assigned Shift Card */}
      {stats.assignedShift && (
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#2B3674]">الشيفت المعين لك</h3>
              <p className="text-sm text-slate-500 mt-2">
                <strong className="text-slate-700">{stats.assignedShift.name}</strong> — {stats.assignedShift.dayOfWeek}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-600">{stats.assignedShift.startTime} — {stats.assignedShift.endTime}</p>
              {!stats.assignedShift.isActive && (
                <p className="text-xs text-rose-600 mt-2 font-bold">حالة الشيفت: غير مفعل</p>
              )}
            </div>
          </div>
          {stats.assignedShift.description && (
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">{stats.assignedShift.description}</p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Online Specialists */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse"></span>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">أونلاين الآن</p>
              <p className="text-3xl font-black text-[#2B3674]">{stats.onlineSpecialists}</p>
              <p className="text-[10px] font-bold text-[#A3AED0] mt-1">من أصل {stats.totalSpecialists}</p>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">الجلسات اليوم</p>
              <p className="text-3xl font-black text-[#2B3674]">{stats.totalSessions}</p>
            </div>
          </div>
        </div>



        {/* Commissions */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#A3AED0] mb-1">عمولتك اليومية</p>
              <p className="text-3xl font-black text-[#2B3674]">{stats.totalCommissions}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">ج.م</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-[24px] p-7 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-[#2B3674]">📋 التقارير والطباعة</h3>
            <p className="text-sm text-[#A3AED0] mt-1">اختر نوع التقرير ثم قم بالطباعة أو التحميل بصيغة Excel.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={handlePrintReport}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4318FF] text-white rounded-2xl hover:bg-[#2B12D3] transition font-semibold w-full sm:w-auto shadow-sm text-sm"
            >
              <PrinterIcon size={18} />
              طباعة التقرير
            </button>
            <button
              onClick={() => {
                const csv = generateCSV(stats);
                downloadCSV(csv);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-2xl hover:bg-[#0F9A6E] transition font-semibold w-full sm:w-auto shadow-sm text-sm"
            >
              <Download size={18} />
              تحميل Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="summary"
              checked={reportType === "summary"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4 text-[#4318FF]"
            />
            <span className="font-bold text-slate-700 truncate text-sm">📊 ملخص عام</span>
          </label>
          <label className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="specialists"
              checked={reportType === "specialists"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4 text-[#4318FF]"
            />
            <span className="font-bold text-slate-700 truncate text-sm">👨‍⚕️ الأخصائيين</span>
          </label>
          <label className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="patients"
              checked={reportType === "patients"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4 text-[#4318FF]"
            />
            <span className="font-bold text-slate-700 truncate text-sm">🤒 المرضى</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-[#4318FF] rounded-2xl cursor-pointer hover:bg-indigo-100 transition font-bold text-xs">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#4318FF]"
            />
            <span>🟢 الأونلاين فقط</span>
          </label>
          <div className="text-xs font-semibold text-slate-400">
            {showOnlineOnly ? "يتم عرض الأخصائيين الأونلاين فقط في الجدول" : "يتم عرض جميع الأخصائيين المسجلين في الجدول"}
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#2B3674]">فريقك ({stats.totalSpecialists} أخصائي)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-[#A3AED0] uppercase tracking-wide text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">الجلسات</th>
                <th className="px-6 py-4 font-bold">العمولة</th>
                <th className="px-6 py-4 font-bold">الاسم</th>
                <th className="px-6 py-4 text-center font-bold">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.team
                .filter((specialist) => !showOnlineOnly || specialist.isOnline)
                .map((specialist) => (
                <tr key={specialist.specialistId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      specialist.isOnline
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    } border`}>
                      <span className={`w-2 h-2 rounded-full ${
                        specialist.isOnline ? "bg-emerald-500" : "bg-rose-500"
                      }`} />
                      {specialist.isOnline ? "أونلاين" : "أوفلاين"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">{specialist.appointmentsToday}</td>
                  <td className="px-6 py-4 text-[#4318FF] font-bold">{specialist.commissionEarnings} ج.م</td>
                  <td className="px-6 py-4 text-[#2B3674] font-bold">{specialist.specialistName}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedSpecialist(specialist);
                        setShowDetails(true);
                      }}
                      className="text-[#4318FF] hover:text-[#2B12D3] font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition"
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedSpecialist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedSpecialist.specialistName}
                </h2>
                <p className={`text-sm mt-1 ${
                  selectedSpecialist.isOnline ? "text-green-600" : "text-red-600"
                }`}>
                  {selectedSpecialist.isOnline ? "🟢 متاح الآن" : "🔴 غير متاح حالياً"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleSpecialistStatus}
                  disabled={togglingStatus}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-semibold transition ${
                    selectedSpecialist.isOnline
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {selectedSpecialist.isOnline ? "🔴 تعطيل" : "🟢 تفعيل"}
                </button>
                <button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (!printWindow) return;
                    const html = `
                      <!DOCTYPE html>
                      <html dir="rtl">
                      <head>
                        <meta charset="UTF-8">
                        <title>تقرير الأخصائي</title>
                        <style>
                          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
                          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                          .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
                          .info-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                          th { background: #f0f0f0; padding: 8px; text-align: right; border: 1px solid #ddd; }
                          td { padding: 8px; border: 1px solid #ddd; }
                          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>تقرير الأخصائي</h1>
                          <p>${selectedSpecialist.specialistName}</p>
                        </div>
                        <div class="info">
                          <div class="info-box">
                            <strong>الحالة:</strong>
                            <p>${selectedSpecialist.isOnline ? "أونلاين" : "أوفلاين"}</p>
                          </div>
                          <div class="info-box">
                            <strong>الجلسات اليوم:</strong>
                            <p>${selectedSpecialist.appointmentsToday}</p>
                          </div>
                          <div class="info-box">
                            <strong>العمولة:</strong>
                            <p>${selectedSpecialist.commissionEarnings} ج.م</p>
                          </div>
                        </div>
                        <h3>تفاصيل الجلسات:</h3>
                        <table>
                          <tr>
                            <th>المريض</th>
                            <th>التاريخ والوقت</th>
                            <th>المدة</th>
                            <th>الحالة</th>
                          </tr>
                          ${selectedSpecialist.sessions.map(session => `
                            <tr>
                              <td>${session.patientName}</td>
                              <td>${new Date(session.scheduledAt).toLocaleString("ar-EG")}</td>
                              <td>${session.duration} دقيقة</td>
                              <td>${session.sessionStatus}</td>
                            </tr>
                          `).join("")}
                        </table>
                        <div class="footer">
                          <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG")}</p>
                          <p>© تطبيق نفسي - لوحة تحكم القيادة</p>
                        </div>
                      </body>
                      </html>
                    `;
                    printWindow.document.write(html);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <PrinterIcon size={16} />
                  طباعة
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">الحالة</p>
                  <p className={`text-lg font-bold mt-1 ${
                    selectedSpecialist.isOnline ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedSpecialist.isOnline ? "أونلاين" : "أوفلاين"}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">الجلسات</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {selectedSpecialist.appointmentsToday}
                  </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">العمولة</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {selectedSpecialist.commissionEarnings}
                  </p>
                </div>
              </div>

              {/* Sessions Table */}
              {selectedSpecialist.sessions.length > 0 ? (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">تفاصيل الجلسات ({selectedSpecialist.sessions.length})</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2 text-right">المريض</th>
                          <th className="px-4 py-2 text-right">البريد</th>
                          <th className="px-4 py-2 text-right">الوقت</th>
                          <th className="px-4 py-2 text-right">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedSpecialist.sessions.map((session) => (
                          <tr key={session.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2">{session.patientName}</td>
                            <td className="px-4 py-2 text-xs">{session.patientEmail}</td>
                            <td className="px-4 py-2 text-xs">
                              {new Date(session.scheduledAt).toLocaleString("ar-EG", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                session.sessionStatus === "COMPLETED" ? "bg-green-100 text-green-700" :
                                session.sessionStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {session.sessionStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">لا توجد جلسات اليوم</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateCSV(stats: ShiftLeaderStats): string {
  let csv = "الاسم,الحالة,الجلسات,الأرباح,العمولة\n";
  stats.team.forEach(specialist => {
    csv += `${specialist.specialistName},${specialist.isOnline ? "أونلاين" : "أوفلاين"},${specialist.appointmentsToday},${specialist.totalEarnings},${specialist.commissionEarnings}\n`;
  });
  return csv;
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `shift-leader-report-${new Date().toISOString().split("T")[0]}.csv`);
  link.click();
}
