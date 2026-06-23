import { auth } from "@/lib/auth";
import { AlertCircle } from "lucide-react";
import { ShiftLeaderDashboard } from "@/components/ShiftLeaderDashboard";

export default async function ShiftLeaderPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        غير مصرح - يرجى تسجيل الدخول
      </div>
    );
  }

  // Check if user is Shift Leader or Admin
  const isAuthorized =
    session.user.role === "ADMIN" ||
    session.user.role === "SHIFT_LEADER";

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
        <AlertCircle size={20} />
        غير مصرح - تحتاج صلاحية قيادة الشيفت (SHIFT_LEADER)
      </div>
    );
  }

  return <ShiftLeaderDashboard />;
}
