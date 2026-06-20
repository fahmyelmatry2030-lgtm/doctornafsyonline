import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  try {
    const notifications = [];

    if (userRole === "PATIENT") {
      // Fetch system notifications for Patients
      const sysNotifs = await prisma.systemNotification.findMany({
        where: { target: { in: ["ALL", "PATIENTS"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      sysNotifs.forEach((n) => {
        notifications.push({
          id: `sys-${n.id}`,
          type: "system",
          title: n.title,
          description: n.message,
          time: n.createdAt.toISOString(),
          color: "text-purple-500 bg-purple-50",
        });
      });

      // Fetch patient appointments
      const appointments = await prisma.appointment.findMany({
        where: { patientId: userId },
        include: { therapist: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      });

      appointments.forEach((app) => {
        const dateStr = new Date(app.scheduledAt).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        if (app.status === "CONFIRMED" || app.status === "IN_PROGRESS") {
          notifications.push({
            id: `app-confirmed-${app.id}`,
            type: "appointment",
            title: app.status === "IN_PROGRESS" ? "الجلسة جارية الآن" : "تم تأكيد الموعد",
            description: app.status === "IN_PROGRESS"
              ? `جلستك العلاجية مع د. ${app.therapist.name} جارية الآن. اضغط هنا لدخول غرفة العلاج.`
              : `تم تأكيد جلستك مع د. ${app.therapist.name} بتاريخ ${dateStr}`,
            time: app.updatedAt.toISOString(),
            color: "text-green-500 bg-green-50",
            href: `/session/${app.id}`,
          });
        } else if (app.status === "CANCELLED") {
          notifications.push({
            id: `app-cancelled-${app.id}`,
            type: "appointment",
            title: "تم إلغاء الموعد",
            description: `تم إلغاء جلستك مع د. ${app.therapist.name}`,
            time: app.updatedAt.toISOString(),
            color: "text-red-500 bg-red-50",
            href: "/patient/appointments",
          });
        } else if (app.status === "COMPLETED") {
          notifications.push({
            id: `app-completed-${app.id}`,
            type: "appointment",
            title: "اكتملت الجلسة العلاجية",
            description: `تمت جلستك مع د. ${app.therapist.name} بنجاح. لا تنسَ تقييم تجربتك!`,
            time: app.updatedAt.toISOString(),
            color: "text-amber-500 bg-amber-50",
            href: "/patient/appointments",
          });
        } else if (app.status === "PENDING") {
          notifications.push({
            id: `app-pending-${app.id}`,
            type: "appointment",
            title: "موعد جديد بانتظار التأكيد",
            description: `تم حجز موعد مع د. ${app.therapist.name}، بانتظار تأكيد الإدارة أو الأخصائي.`,
            time: app.createdAt.toISOString(),
            color: "text-indigo-500 bg-indigo-50",
            href: "/patient/billing",
          });
        }
      });
    } else if (userRole === "THERAPIST") {
      // Fetch system notifications for Therapists
      const sysNotifs = await prisma.systemNotification.findMany({
        where: { target: { in: ["ALL", "THERAPISTS"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      sysNotifs.forEach((n) => {
        notifications.push({
          id: `sys-${n.id}`,
          type: "system",
          title: n.title,
          description: n.message,
          time: n.createdAt.toISOString(),
          color: "text-purple-500 bg-purple-50",
        });
      });

      // Fetch therapist appointments
      const appointments = await prisma.appointment.findMany({
        where: { therapistId: userId },
        include: { patient: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      });

      appointments.forEach((app) => {
        const dateStr = new Date(app.scheduledAt).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        if (app.status === "PENDING") {
          notifications.push({
            id: `app-pending-${app.id}`,
            type: "appointment",
            title: "جلسة جديدة بانتظار المراجعة",
            description: `قام المريض ${app.patient.name} بحجز جلسة جديدة بتاريخ ${dateStr}، وهي قيد المراجعة المالية حالياً.`,
            time: app.createdAt.toISOString(),
            color: "text-indigo-500 bg-indigo-50",
            href: "/therapist/dashboard",
          });
        } else if (app.status === "CONFIRMED" || app.status === "IN_PROGRESS") {
          notifications.push({
            id: `app-confirmed-${app.id}`,
            type: "appointment",
            title: app.status === "IN_PROGRESS" ? "الجلسة جارية الآن" : "تم تأكيد موعد جلسة",
            description: app.status === "IN_PROGRESS"
              ? `جلستك العلاجية مع المريض ${app.patient.name} جارية الآن. اضغط هنا لدخول غرفة العلاج.`
              : `تم تأكيد موعد جلستك مع المريض ${app.patient.name} بتاريخ ${dateStr}. يرجى الحضور في الموعد المحدد.`,
            time: app.updatedAt.toISOString(),
            color: "text-green-500 bg-green-50",
            href: `/session/${app.id}`,
          });
        } else if (app.status === "CANCELLED") {
          notifications.push({
            id: `app-cancelled-${app.id}`,
            type: "appointment",
            title: "تم إلغاء الجلسة",
            description: `تم إلغاء الجلسة المقررة مع المريض ${app.patient.name} بتاريخ ${dateStr}.`,
            time: app.updatedAt.toISOString(),
            color: "text-red-500 bg-red-50",
            href: "/therapist/dashboard",
          });
        } else if (app.status === "COMPLETED") {
          notifications.push({
            id: `app-completed-${app.id}`,
            type: "appointment",
            title: "اكتملت الجلسة العلاجية",
            description: `تم إكمال الجلسة العلاجية مع المريض ${app.patient.name} بنجاح. يمكنك الآن كتابة التقرير الطبي.`,
            time: app.updatedAt.toISOString(),
            color: "text-amber-500 bg-amber-50",
            href: "/therapist/dashboard",
          });
        }
      });
    } else {
      // Admin notifications
      const sysNotifs = await prisma.systemNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      sysNotifs.forEach((n) => {
        notifications.push({
          id: `sys-${n.id}`,
          type: "system",
          title: n.title,
          description: n.message,
          time: n.createdAt.toISOString(),
          color: "text-purple-500 bg-purple-50",
        });
      });
    }

    // Sort all notifications by time desc
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Fetch notifications API error:", error);
    return NextResponse.json({ error: "فشل جلب الإشعارات" }, { status: 500 });
  }
}
