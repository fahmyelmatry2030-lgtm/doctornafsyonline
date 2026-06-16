import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientsList from "@/components/PatientsList";

export default async function TherapistPatientsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  // Get distinct patients by grouping appointments
  const patientIdsAggr = await prisma.appointment.groupBy({
    by: ['patientId'],
    where: { therapistId: userId },
  });

  const patientIds = patientIdsAggr.map(p => p.patientId);

  const patients = await prisma.user.findMany({
    where: { id: { in: patientIds } },
    include: {
      patientAppointments: {
        where: { therapistId: userId },
        orderBy: { scheduledAt: 'desc' },
        take: 1
      }
    }
  });

  const formattedPatients = patients.map(patient => ({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    lastSessionDate: patient.patientAppointments[0]?.scheduledAt
      ? patient.patientAppointments[0].scheduledAt.toISOString()
      : null,
  }));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة المرضى</h1>
        <p className="text-slate-600 mt-2 text-lg">قائمة بالمرضى الذين يتلقون العلاج لديك والسجل الطبي لهم.</p>
      </div>

      <PatientsList initialPatients={formattedPatients} />
    </div>
  );
}
