const fs = require('fs');

const arPath = './messages/ar.json';
const enPath = './messages/en.json';

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

arData.DashboardLayout = {
  "searchPlaceholder": "ابحث في هذه الصفحة...",
  "notificationsTitle": "الإشعارات",
  "clearAll": "مسح الكل",
  "noNewNotifications": "لا توجد إشعارات جديدة",
  "dashboard": "لوحة التحكم",
  "profile": "الملف الشخصي",
  "logout": "تسجيل الخروج",
  "patientHome": "الرئيسية",
  "myAppointments": "مواعيدي",
  "reviews": "التقييمات",
  "treatmentRoom": "غرفة العلاج",
  "billing": "الفواتير",
  "therapistHome": "الرئيسية",
  "patients": "المرضى",
  "schedule": "الجدول",
  "mySalary": "مرتبي",
  "settings": "الإعدادات",
  "shiftLeaderDashboard": "لوحة التحكم",
  "customerServiceDashboard": "لوحة خدمة العملاء",
  "marketingDashboard": "الرئيسية",
  "adminHome": "الرئيسية",
  "manageManagers": "إدارة المديرين",
  "manageShifts": "إدارة الشيفتات",
  "verifyTherapists": "توثيق واعتماد الأخصائيين",
  "managePatients": "إدارة المرضى",
  "manageTherapistSalaries": "إدارة مرتبات الأخصائيين",
  "manageEmployeeSalaries": "إدارة رواتب فريق العمل",
  "siteSettings": "إعدادات الموقع (نصوص، كوبونات، شروط)",
  "financialReports": "التقارير المكتملة وحسابات المنصة"
};

enData.DashboardLayout = {
  "searchPlaceholder": "Search in this page...",
  "notificationsTitle": "Notifications",
  "clearAll": "Clear All",
  "noNewNotifications": "No new notifications",
  "dashboard": "Dashboard",
  "profile": "Profile",
  "logout": "Log Out",
  "patientHome": "Home",
  "myAppointments": "My Appointments",
  "reviews": "Reviews",
  "treatmentRoom": "Treatment Room",
  "billing": "Billing",
  "therapistHome": "Home",
  "patients": "Patients",
  "schedule": "Schedule",
  "mySalary": "My Salary",
  "settings": "Settings",
  "shiftLeaderDashboard": "Dashboard",
  "customerServiceDashboard": "Customer Service",
  "marketingDashboard": "Home",
  "adminHome": "Home",
  "manageManagers": "Manage Managers",
  "manageShifts": "Manage Shifts",
  "verifyTherapists": "Verify Therapists",
  "managePatients": "Manage Patients",
  "manageTherapistSalaries": "Therapist Salaries",
  "manageEmployeeSalaries": "Employee Salaries",
  "siteSettings": "Site Settings (Content, Coupons, Terms)",
  "financialReports": "Financial Reports"
};

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log("Translations appended.");
