import { auth } from "@/lib/auth";
import { AlertCircle, Users, Calendar, Clock } from "lucide-react";
import { CustomerServiceTabs } from "@/components/CustomerServiceTabs";

export default async function CustomerServicePage() {
  const session = await auth();

  // Check if user has required role
  if (!session?.user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        غير مصرح - يرجى تسجيل الدخول
      </div>
    );
  }

  const isAuthorized =
    session.user.role === "ADMIN" ||
    session.user.role === "ADMIN_CUSTOMER_SERVICE" ||
    session.user.role === "ADMIN_HR";

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        غير مصرح - تحتاج صلاحية خدمة العملاء (ADMIN_CUSTOMER_SERVICE)
      </div>
    );
  }

  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Users size={32} />
          لوحة تحكم خدمة العملاء
        </h1>
        <p className="text-slate-500 mt-2">
          إدارة الأخصائيين والجلسات والمواعيد المتاحة
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Users size={16} />
            الأخصائيين
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">8</div>
          <p className="text-xs text-slate-500 mt-1">الفترة الحالية</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Calendar size={16} />
            الجلسات اليوم
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">12</div>
          <p className="text-xs text-slate-500 mt-1">مجدولة وجارية</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Clock size={16} />
            المتاحة
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">24</div>
          <p className="text-xs text-slate-500 mt-1">موعد فارغ هذا الأسبوع</p>
        </div>
      </div>

      {/* Main Content */}
      <CustomerServiceTabs startDate={startDate} endDate={endDate} />

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900">💡 نصيحة استخدام</h4>
        <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
          <li>استخدم "لوحة الفترات" لرؤية جميع الجلسات والأخصائيين في الفترة الزمنية</li>
          <li>
            استخدم "المواعيد المتاحة" عند استقبال طلب حجز عبر WhatsApp أو Facebook
          </li>
          <li>
            إذا كان هناك تأخير في دخول المريض أو الأخصائي، يمكنك التواصل معهم عبر
            WhatsApp
          </li>
        </ul>
      </div>
    </div>
  );
}
