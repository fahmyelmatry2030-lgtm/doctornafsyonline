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
            <th>الأرباح (ج.م)</th>
            <th>العمولة (ج.م)</th>
            <th>الاسم</th>
          </tr>
          ${stats.team.map(specialist => `
            <tr>
              <td><span class="${specialist.isOnline ? 'online' : 'offline'}">${specialist.isOnline ? '🟢 أونلاين' : '🔴 أوفلاين'}</span></td>
              <td>${specialist.appointmentsToday}</td>
              <td>${specialist.totalEarnings}</td>
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
              <tr><td>الأرباح الكلية (ج.م)</td><td><strong>${specialist.totalEarnings}</strong></td></tr>
              <tr><td>عمولتك (ج.م)</td><td><strong>${specialist.commissionEarnings}</strong></td></tr>
            </table>
            
            ${specialist.sessions.length > 0 ? `
              <h3>جلسات اليوم (${specialist.sessions.length})</h3>
              <table>
                <tr><th>المريض</th><th>الوقت</th><th>الحالة</th><th>المبلغ (ج.م)</th></tr>
                ${specialist.sessions.map(s => `
                  <tr>
                    <td>${s.patientName}</td>
                    <td>${new Date(s.scheduledAt).toLocaleTimeString("ar-EG", {hour:"2-digit", minute:"2-digit"})}</td>
                    <td>${s.sessionStatus}</td>
                    <td>${s.amount}</td>
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
            <th>المبلغ (ج.م)</th>
          </tr>
          ${allSessions.map(session => `
            <tr>
              <td>${session.specialistName}</td>
              <td>${session.patientName}</td>
              <td>${session.patientEmail}</td>
              <td>${session.patientPhone || '-'}</td>
              <td>${new Date(session.scheduledAt).toLocaleString("ar-EG", {month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"})}</td>
              <td>${session.sessionStatus}</td>
              <td>${session.amount}</td>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          لوحة تحكم قيادة الشيفت
        </h1>
        <p className="text-slate-500 mt-2">
          تابع فريقك والعمولات اليومية والأرباح
        </p>
      </div>

      {/* Assigned Shift Card */}
      {stats.assignedShift && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900">الشيفت المعين لك</h3>
          <p className="text-sm text-slate-700 mt-1">
            <strong>{stats.assignedShift.name}</strong> — {stats.assignedShift.dayOfWeek}
          </p>
          <p className="text-sm text-slate-600">{stats.assignedShift.startTime} — {stats.assignedShift.endTime}</p>
          {stats.assignedShift.description && (
            <p className="text-xs text-slate-500 mt-2">{stats.assignedShift.description}</p>
          )}
          {!stats.assignedShift.isActive && (
            <p className="text-xs text-red-600 mt-2">حالة الشيفت: غير مفعل</p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Online Specialists */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">أونلاين الآن</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats.onlineSpecialists}
              </p>
              <p className="text-xs text-green-600 mt-1">من {stats.totalSpecialists}</p>
            </div>
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
              <span className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">الجلسات اليوم</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalSessions}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">الأرباح</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalEarnings}</p>
              <p className="text-xs text-purple-600 mt-1">ج.م</p>
            </div>
            <DollarSign className="text-purple-400" size={32} />
          </div>
        </div>

        {/* Commissions */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">عمولتك</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.totalCommissions}</p>
              <p className="text-xs text-orange-600 mt-1">ج.م</p>
            </div>
            <TrendingUp className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">📋 التقارير والطباعة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 p-3 bg-white rounded border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="summary"
              checked={reportType === "summary"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-slate-700 truncate">📊 ملخص عام</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-white rounded border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="specialists"
              checked={reportType === "specialists"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-slate-700 truncate">👨‍⚕️ الأخصائيين</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-white rounded border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition min-w-0">
            <input
              type="radio"
              name="reportType"
              value="patients"
              checked={reportType === "patients"}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-slate-700 truncate">🤒 المرضى</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr] gap-3 items-center">
          <button
            onClick={handlePrintReport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold w-full"
          >
            <PrinterIcon size={18} />
            طباعة التقرير
          </button>
          <button
            onClick={() => {
              const csv = generateCSV(stats);
              downloadCSV(csv);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold w-full"
          >
            <Download size={18} />
            تحميل Excel
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-200 transition font-semibold w-full">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span>🟢 الأونلاين فقط</span>
          </label>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">فريقك - {stats.totalSpecialists} أخصائي</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الجلسات</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الأرباح (ج.م)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">عمولتك (ج.م)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاسم</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.team
                .filter((specialist) => !showOnlineOnly || specialist.isOnline)
                .map((specialist) => (
                <tr key={specialist.specialistId} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      specialist.isOnline
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        specialist.isOnline ? "bg-green-600" : "bg-red-600"
                      }`}></span>
                      {specialist.isOnline ? "🟢 أونلاين" : "🔴 أوفلاين"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{specialist.appointmentsToday}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{specialist.totalEarnings}</td>
                  <td className="px-6 py-4 text-orange-600 font-bold">{specialist.commissionEarnings}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{specialist.specialistName}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedSpecialist(specialist);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      عرض
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
                            <strong>الأرباح:</strong>
                            <p>${selectedSpecialist.totalEarnings} ج.م</p>
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
                            <th>المبلغ</th>
                          </tr>
                          ${selectedSpecialist.sessions.map(session => `
                            <tr>
                              <td>${session.patientName}</td>
                              <td>${new Date(session.scheduledAt).toLocaleString("ar-EG")}</td>
                              <td>${session.duration} دقيقة</td>
                              <td>${session.sessionStatus}</td>
                              <td>${session.amount} ج.م</td>
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
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">الأرباح</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {selectedSpecialist.totalEarnings}
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
                          <th className="px-4 py-2 text-right">المبلغ</th>
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
                            <td className="px-4 py-2 font-semibold">{session.amount} ج.م</td>
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
