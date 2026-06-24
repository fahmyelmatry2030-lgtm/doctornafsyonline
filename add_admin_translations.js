const fs = require('fs');

const arPath = './messages/ar.json';
const enPath = './messages/en.json';

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

arData.AdminDashboard = {
  "dashboardError": "حدث خطأ أثناء تحميل لوحة التحكم",
  "dashboardErrorDesc": "يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.",
  "welcome": "مرحباً بعودتك للوحة القيادة 👋",
  "welcomeDesc": "إليك ملخص سريع لأداء المنصة اليوم. لديك",
  "pendingVerificationText": "طلبات توثيق",
  "needsReviewText": "تحتاج لمراجعتك.",
  "todayDate": "تاريخ اليوم",
  "totalPatients": "إجمالي المرضى",
  "totalTherapists": "إجمالي الأخصائيين",
  "todaySessions": "جلسات اليوم",
  "activeSessionsNow": "جلسات جارية الآن",
  "platformEarnings": "أرباح المنصة (الشهر الحالي)",
  "currency": "ج.م",
  "comparedToLastMonth": "مقارنة بالشهر الماضي",
  "sessionsSummary": "ملخص حالة الجلسات",
  "totalSessionsLabel": "إجمالي: {total} جلسة",
  "completedSessions": "جلسات مكتملة",
  "activeConfirmedSessions": "جلسات نشطة/مؤكدة",
  "cancelledSessions": "جلسات ملغية",
  "verificationRequests": "طلبات التوثيق",
  "manageAll": "إدارة الكل",
  "noPendingVerifications": "لا توجد طلبات توثيق معلقة",
  "review": "مراجعة",
  "recentAppointments": "أحدث الحجوزات",
  "viewOperations": "عرض العمليات",
  "noRecentAppointments": "لا توجد حجوزات حديثة",
  "patientTherapistCol": "المريض / الأخصائي",
  "dateCostCol": "التاريخ والتكلفة",
  "dateCol": "التاريخ",
  "statusCol": "الحالة",
  "with": "مع:"
};

enData.AdminDashboard = {
  "dashboardError": "Error loading dashboard",
  "dashboardErrorDesc": "Please try again or contact technical support.",
  "welcome": "Welcome back to the dashboard 👋",
  "welcomeDesc": "Here is a quick summary of the platform's performance today. You have",
  "pendingVerificationText": "verification requests",
  "needsReviewText": "that need your review.",
  "todayDate": "Today's Date",
  "totalPatients": "Total Patients",
  "totalTherapists": "Total Therapists",
  "todaySessions": "Today's Sessions",
  "activeSessionsNow": "Active Sessions Now",
  "platformEarnings": "Platform Earnings (Current Month)",
  "currency": "EGP",
  "comparedToLastMonth": "Compared to last month",
  "sessionsSummary": "Sessions Summary",
  "totalSessionsLabel": "Total: {total} sessions",
  "completedSessions": "Completed Sessions",
  "activeConfirmedSessions": "Active/Confirmed Sessions",
  "cancelledSessions": "Cancelled Sessions",
  "verificationRequests": "Verification Requests",
  "manageAll": "Manage All",
  "noPendingVerifications": "No pending verification requests",
  "review": "Review",
  "recentAppointments": "Recent Appointments",
  "viewOperations": "View Operations",
  "noRecentAppointments": "No recent appointments",
  "patientTherapistCol": "Patient / Therapist",
  "dateCostCol": "Date & Cost",
  "dateCol": "Date",
  "statusCol": "Status",
  "with": "with:"
};

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("AdminDashboard Translations appended.");
