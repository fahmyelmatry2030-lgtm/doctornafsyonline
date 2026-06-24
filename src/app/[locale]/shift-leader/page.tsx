import { auth } from "@/lib/auth";
import { AlertCircle } from "lucide-react";
import { ShiftLeaderDashboard } from "@/components/ShiftLeaderDashboard";
import Link from "next/link";

export default async function ShiftLeaderRootPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 p-6">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-2">غير مصرح - يرجى تسجيل الدخول</h3>
            <p className="text-sm mb-3">لا يوجد جلسة نشطة. الرجاء تسجيل الدخول أولاً.</p>
            <Link href="/login" className="text-red-600 underline font-semibold hover:text-red-800">
              ادخل إلى صفحة الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthorized = session.user.role === "SHIFT_LEADER" || session.user.role === "ADMIN";
  if (!isAuthorized) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 p-6">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-2">غير مصرح - تحتاج صلاحية قائد الشيفت</h3>
            <p className="text-sm mb-3">دورك الحالي: <strong>{session.user.role}</strong></p>
            <p className="text-sm mb-3">هذه الصفحة مخصصة فقط لأصحاب صلاحية <strong>SHIFT_LEADER</strong> أو <strong>ADMIN</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  return <ShiftLeaderDashboard />;
}
