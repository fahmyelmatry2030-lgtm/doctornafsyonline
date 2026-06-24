import { auth } from "@/lib/auth";
import { ReactNode } from "react";

export default async function CustomerServiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Check role
  const isAuthorized =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "ADMIN_CUSTOMER_SERVICE" ||
    session?.user?.role === "ADMIN_HR" ||
    session?.user?.role === "SHIFT_LEADER";

  if (!isAuthorized) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          غير مصرح - تحتاج صلاحية خدمة العملاء أو قائد الشيفت
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
