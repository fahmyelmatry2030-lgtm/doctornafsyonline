import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Users, Mail, Phone, Calendar, Activity, Ban, CheckCircle, Trash2, ShieldOff } from "lucide-react";
import { DeletePatientButton } from "./DeletePatientButton";

export default async function AdminPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: {
      _count: { select: { patientAppointments: true } },
      patientAppointments: {
        where: { status: "COMPLETED" },
        select: { price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSpend = patients.reduce((sum, p) => sum + p.patientAppointments.reduce((s, a) => s + a.price, 0), 0);
  const activePatients = patients.filter(p => p._count.patientAppointments > 0).length;
  const suspendedPatients = patients.filter(p => p.isSuspended).length;

  async function toggleSuspend(userId: string, currentStatus: boolean) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");
    
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !currentStatus },
    });
    revalidatePath("/admin/patients");
  }

  async function deletePatient(userId: string) {
    "use server";
    const s = await auth();
    if (!s?.user || s.user.role !== "ADMIN") throw new Error("غير مصرح لك");

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/patients");
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة المرضى</h1>
          <p className="text-slate-500 mt-1">التحكم الكامل في حسابات المرضى المسجلين</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي المرضى", value: patients.length, icon: <Users className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50", suffix: "" },
          { label: "مرضى نشطون", value: activePatients, icon: <Activity className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", suffix: "" },
          { label: "حسابات موقوفة", value: suspendedPatients, icon: <Ban className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50", suffix: "" },
          { label: "إجمالي الإنفاق", value: totalSpend.toLocaleString(), icon: <Calendar className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50", suffix: " ج.م" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-[var(--color-border-soft)] p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}{s.suffix}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Patients Table */}
      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">المرضى المسجلون</h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{patients.length} مريض</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs">
              <tr>
                <th className="px-5 py-4">المريض</th>
                <th className="px-5 py-4">التواصل</th>
                <th className="px-5 py-4">تاريخ التسجيل</th>
                <th className="px-5 py-4 text-center">الجلسات</th>
                <th className="px-5 py-4 text-center">الإنفاق</th>
                <th className="px-5 py-4 text-center">الحالة</th>
                <th className="px-5 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.map(p => {
                const spent = p.patientAppointments.reduce((s, a) => s + a.price, 0);
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.isSuspended ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${p.isSuspended ? "bg-red-100 text-red-600" : "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600"}`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{p.name}</span>
                          {p.isSuspended && <span className="mr-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold">موقوف</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" /> {p.email}
                        </span>
                        {p.phone && (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {p.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(p.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-black text-indigo-600 text-lg">{p._count.patientAppointments}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-bold text-emerald-600">{spent > 0 ? `${spent.toLocaleString()} ج.م` : "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        p.isSuspended
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : p._count.patientAppointments > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}>
                        {p.isSuspended ? "موقوف" : p._count.patientAppointments > 0 ? "نشط" : "جديد"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Suspend / Unsuspend */}
                        <form action={toggleSuspend.bind(null, p.id, p.isSuspended)}>
                          <button
                            type="submit"
                            title={p.isSuspended ? "رفع الإيقاف" : "إيقاف الحساب"}
                            className={`p-2 rounded-lg transition-colors ${
                              p.isSuspended
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                            }`}
                          >
                            {p.isSuspended
                              ? <CheckCircle className="w-4 h-4" />
                              : <ShieldOff className="w-4 h-4" />
                            }
                          </button>
                        </form>
                        {/* Delete with Client confirmation */}
                        <DeletePatientButton
                          patientId={p.id}
                          patientName={p.name}
                          onDelete={deletePatient}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    لا يوجد مرضى مسجلون بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
