const fs = require('fs');

const arPath = './messages/ar.json';
const enPath = './messages/en.json';

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

arData.TherapistDashboard = {
  "avatarReminderTitle": "تنبيه: صورتك الشخصية مفقودة",
  "avatarReminderDesc": "أكمل ملفك الشخصي وارفع صورتك الآن. الأخصائيون الذين يمتلكون صوراً شخصية واضحة يحصلون على حجوزات أكثر بـ 3 أضعاف!",
  "uploadAvatarNow": "رفع الصورة الآن",
  "welcome": "مرحباً بك، د. {name} 🩺",
  "availableForBookings": "متاح للحجوزات",
  "notAvailableForBookings": "غير متاح للحجوزات",
  "activePatients": "إجمالي المرضى (نشطين)",
  "todaySessions": "جلسات اليوم",
  "pendingRequests": "طلبات معلقة",
  "completedSessions": "إجمالي الجلسات المكتملة",
  "ongoingSessionTitle": "جلسة قيد الانعقاد الآن",
  "ongoingSessionDesc": "لديك جلسة حالية مع {name}. يرجى الانضمام للغرفة لتجنب التأخير.",
  "joinSession": "دخول الغرفة",
  "todayAppointments": "مواعيدك اليوم",
  "viewSchedule": "عرض الجدول كامل",
  "noAppointmentsToday": "لا يوجد مواعيد باقية اليوم",
  "noAppointmentsDesc": "استمتع بيومك! يمكنك تعديل أوقات متاحيتك لجذب المزيد من الحجوزات.",
  "updateAvailability": "تحديث الأوقات",
  "recentCompletedSessions": "أحدث الجلسات المكتملة",
  "allHistory": "كل السجل",
  "writeNotes": "كتابة الملاحظات",
  "noRecentSessions": "لا توجد جلسات حديثة",
  "noRecentSessionsDesc": "بمجرد الانتهاء من جلسة، ستظهر هنا لإضافة ملاحظاتك العلاجية.",
  "quickActions": "إجراءات سريعة",
  "manageSchedule": "إدارة المواعيد",
  "manageScheduleDesc": "إضافة أو تعديل أوقاتك المتاحة",
  "chatMessages": "الرسائل",
  "chatMessagesDesc": "الرد على استفسارات مرضاك",
  "financialReports": "التقارير المالية",
  "financialReportsDesc": "متابعة أرباحك وعمولاتك",
  "myProfile": "الملف الشخصي",
  "myProfileDesc": "تحديث بياناتك وتقييماتك"
};

enData.TherapistDashboard = {
  "avatarReminderTitle": "Alert: Profile Picture Missing",
  "avatarReminderDesc": "Complete your profile and upload your photo now. Therapists with clear profile pictures get 3x more bookings!",
  "uploadAvatarNow": "Upload Photo Now",
  "welcome": "Welcome, Dr. {name} 🩺",
  "availableForBookings": "Available for Bookings",
  "notAvailableForBookings": "Not Available for Bookings",
  "activePatients": "Total Active Patients",
  "todaySessions": "Today's Sessions",
  "pendingRequests": "Pending Requests",
  "completedSessions": "Total Completed Sessions",
  "ongoingSessionTitle": "Ongoing Session Now",
  "ongoingSessionDesc": "You have a current session with {name}. Please join the room to avoid delays.",
  "joinSession": "Join Room",
  "todayAppointments": "Today's Appointments",
  "viewSchedule": "View Full Schedule",
  "noAppointmentsToday": "No remaining appointments today",
  "noAppointmentsDesc": "Enjoy your day! You can update your availability to attract more bookings.",
  "updateAvailability": "Update Availability",
  "recentCompletedSessions": "Recent Completed Sessions",
  "allHistory": "All History",
  "writeNotes": "Write Notes",
  "noRecentSessions": "No recent sessions",
  "noRecentSessionsDesc": "Once a session is completed, it will appear here for you to add clinical notes.",
  "quickActions": "Quick Actions",
  "manageSchedule": "Manage Schedule",
  "manageScheduleDesc": "Add or modify your available times",
  "chatMessages": "Messages",
  "chatMessagesDesc": "Respond to patient inquiries",
  "financialReports": "Financial Reports",
  "financialReportsDesc": "Track your earnings and commissions",
  "myProfile": "My Profile",
  "myProfileDesc": "Update your details and reviews"
};

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("TherapistDashboard Translations appended.");
