const fs = require('fs');

const arPath = './messages/ar.json';
const enPath = './messages/en.json';

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

arData.PatientDashboard = {
  "welcome": "مرحباً بك، {name} 🌟",
  "welcomeDesc": "أهلاً بك في مساحتك الآمنة. كيف تشعر اليوم؟ نحن هنا لدعمك في رحلتك نحو صحة نفسية أفضل.",
  "bookNewSession": "حجز جلسة جديدة",
  "reviewPreviousSession": "تقييم جلستك السابقة",
  "reviewDesc": "لديك جلسة مكتملة مع د. {name}. رأيك يهمنا ويساعدنا في تحسين جودة الخدمة.",
  "reviewNow": "تقييم الجلسة الآن",
  "upcomingSessions": "الجلسات القادمة",
  "completedSessions": "الجلسات المكتملة",
  "totalSessions": "إجمالي الجلسات",
  "nextAppointments": "مواعيدك القادمة",
  "viewAll": "عرض الكل",
  "joinSession": "دخول الغرفة",
  "noUpcoming": "لا توجد جلسات قادمة",
  "noUpcomingDesc": "ليس لديك أي مواعيد مجدولة حالياً. يمكنك تصفح الأخصائيين المتاحين وحجز موعد جديد.",
  "quickActions": "إجراءات سريعة",
  "browseTherapists": "تصفح الأخصائيين المتاحين",
  "browseTherapistsDesc": "ابحث عن الأخصائي المناسب لاحتياجاتك",
  "latestArticles": "أحدث المقالات المفيدة",
  "latestArticlesDesc": "اقرأ عن الصحة النفسية وتطوير الذات"
};

enData.PatientDashboard = {
  "welcome": "Welcome back, {name} 🌟",
  "welcomeDesc": "Welcome to your safe space. How are you feeling today? We are here to support you on your journey to better mental health.",
  "bookNewSession": "Book New Session",
  "reviewPreviousSession": "Review Previous Session",
  "reviewDesc": "You have a completed session with Dr. {name}. Your feedback is important to us and helps us improve our service quality.",
  "reviewNow": "Review Session Now",
  "upcomingSessions": "Upcoming Sessions",
  "completedSessions": "Completed Sessions",
  "totalSessions": "Total Sessions",
  "nextAppointments": "Your Next Appointments",
  "viewAll": "View All",
  "joinSession": "Join Room",
  "noUpcoming": "No upcoming sessions",
  "noUpcomingDesc": "You don't have any scheduled appointments currently. You can browse available therapists and book a new appointment.",
  "quickActions": "Quick Actions",
  "browseTherapists": "Browse Available Therapists",
  "browseTherapistsDesc": "Find the right therapist for your needs",
  "latestArticles": "Latest Helpful Articles",
  "latestArticlesDesc": "Read about mental health and self-development"
};

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("PatientDashboard Translations appended.");
