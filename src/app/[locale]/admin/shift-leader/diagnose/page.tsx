import { Suspense } from "react";

async function DiagnoseContent() {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/shift-leader/diagnose`,
      { cache: "no-store" }
    );
    const data = await response.json();

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">🔍 تشخيص الأخطاء</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(data.checks || {}).map(([key, check]: [string, any]) => (
            <div
              key={key}
              className={`p-6 rounded-lg border-2 ${
                check.status === "success"
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                {check.status === "success" ? "✅" : "❌"} {key}
              </h3>
              <pre className="bg-white p-3 rounded overflow-auto text-sm">
                {JSON.stringify(check, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h2 className="text-xl font-bold mb-3">📝 الملخص:</h2>
          <div className="space-y-2 text-sm">
            {data.checks?.auth?.status === "error" && (
              <p className="text-red-700">❌ مشكلة في التحقق من الهوية (Auth)</p>
            )}
            {data.checks?.database?.status === "error" && (
              <p className="text-red-700">❌ مشكلة في اتصال قاعدة البيانات</p>
            )}
            {data.checks?.authorization?.status === "success" &&
              !data.checks?.authorization?.isAuthorized && (
                <p className="text-red-700">
                  ❌ المستخدم الحالي ليس لديه صلاحيات Shift Leader
                </p>
              )}
            {data.checks?.shiftLeaders?.count === 0 && (
              <p className="text-orange-700">
                ⚠️ لا توجد قادة شيفت (Shift Leaders) في النظام
              </p>
            )}
            {data.checks?.commission?.status === "error" && (
              <p className="text-red-700">❌ مشكلة في نموذج Commission في Prisma</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-700 mb-6">❌ خطأ في التشخيص</h1>
        <pre className="bg-red-50 border border-red-300 p-6 rounded text-sm overflow-auto">
          {error.message}
        </pre>
      </div>
    );
  }
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xl">جاري التحميل...</div>}>
      <DiagnoseContent />
    </Suspense>
  );
}
