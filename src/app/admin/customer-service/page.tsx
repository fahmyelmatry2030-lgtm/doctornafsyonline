import { auth } from "@/lib/auth";
import { AlertCircle } from "lucide-react";
import { CustomerServiceTabs } from "@/components/CustomerServiceTabs";
import { CustomerServiceDashboard } from "@/components/CustomerServiceDashboard";

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
    session.user.role === "ADMIN_HR" ||
    session.user.role === "SHIFT_LEADER";

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        غير مصرح - تحتاج صلاحية خدمة العملاء (ADMIN_CUSTOMER_SERVICE) أو قائد الشيفت (SHIFT_LEADER)
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
        <h1 className="text-3xl font-black text-slate-900">
          لوحة تحكم خدمة العملاء
        </h1>
        <p className="text-slate-500 mt-2">
          اضغط على أي مربع لعرض البيانات التفصيلية
        </p>
      </div>

      {/* Interactive Dashboard */}
      <CustomerServiceDashboard startDate={startDate} endDate={endDate} />

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
