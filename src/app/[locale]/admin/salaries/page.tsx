import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SalariesClientTable } from "@/components/SalariesClientTable";
import { AlertCircle } from "lucide-react";

export default async function AdminSalariesPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || (role !== "ADMIN" && role !== "ADMIN_ACCOUNTING" && role !== "ADMIN_VIEWER")) {
    redirect("/dashboard");
  }

  const isReadOnly = role === "ADMIN_VIEWER";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let dbTherapists = [];
  try {
    // Fetch therapists with their profiles and completed sessions count for the current month
    dbTherapists = await prisma.user.findMany({
      where: { role: "THERAPIST" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        therapistProfile: {
          select: {
            pricePerSession: true,
            salary: true,
            salaryType: true,
            paymentMethod: true,
            paymentDetails: true,
          },
        },
        therapistAppointments: {
          where: {
            status: "COMPLETED",
            scheduledAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            id: true,
          },
        },
        employeeBonuses: {
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
        monthlySalaryRecords: {
          where: {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (dbError: any) {
    console.error("[Salaries Page] Database query failed:", dbError);
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

  const formattedTherapists = dbTherapists.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    completedSessionsCount: t.therapistAppointments.length,
    therapistProfile: t.therapistProfile,
    employeeBonuses: (t.employeeBonuses || []).map(b => ({
      ...b,
      createdAt: b.createdAt.toISOString()
    })),
    monthlySalaryRecords: (t.monthlySalaryRecords || []).map(r => ({
      ...r,
      status: r.status as "PENDING" | "PAID" | "ACKNOWLEDGED"
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة مرتبات الأخصائيين</h1>
        <p className="text-slate-500 mt-2">
          إدارة وتعديل رواتب الأخصائيين المحددة شهرياً ومتابعة إحصائيات الدفع للشهر الحالي
        </p>
      </div>

      <SalariesClientTable initialTherapists={formattedTherapists} isReadOnly={isReadOnly} />
    </div>
  );
}
