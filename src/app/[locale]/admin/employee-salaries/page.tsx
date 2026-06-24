import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmployeeSalariesClientTable } from "@/components/EmployeeSalariesClientTable";
import { AlertCircle } from "lucide-react";

export default async function AdminEmployeeSalariesPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) {
    redirect("/dashboard");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let employees = [];
  try {
    employees = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", "SHIFT_LEADER", "ADMIN_CUSTOMER_SERVICE", "ADMIN_MARKETING"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        baseSalary: true,
        employeeBonuses: {
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        },
      },
      orderBy: { createdAt: "desc" }
    });
  } catch (dbError: any) {
    console.error("[Employee Salaries Page] Database query failed:", dbError);
    return (
      <div className="p-6 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
          <AlertCircle size={24} className="mb-2 text-amber-600" />
          <h3 className="font-bold text-lg mb-2">خطأ في الاتصال بقاعدة البيانات (Schema Mismatch)</h3>
          <p className="text-sm mb-4">
            حدث هذا الخطأ غالباً لأنك قمت بتحديث الكود ولكن لم تقم بتحديث أعمدة قاعدة البيانات بعد.
          </p>
          <div className="bg-white p-4 rounded-xl border border-amber-100 text-xs font-mono text-slate-700 mb-4 break-words">
            {dbError.message || "Unknown Database Error"}
          </div>
          <p className="text-sm mb-3">
            <strong>الحل:</strong> يرجى فتح الرابط التالي لتحديث قاعدة البيانات فوراً:
          </p>
          <a 
            href="/api/admin/setup-db?secret=NafsiDatabaseSetup2026" 
            target="_blank" 
            className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-750 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            تحديث قاعدة البيانات الآن ⚙️
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">رواتب فريق العمل (الإدارة والمبيعات)</h1>
        <p className="text-slate-500 mt-2">
          إدارة الرواتب الثابتة والعمولات لموظفي الإدارة، الموارد البشرية، خدمة العملاء، وقادة الشيفت.
        </p>
      </div>

      <EmployeeSalariesClientTable initialEmployees={employees} />
    </div>
  );
}
