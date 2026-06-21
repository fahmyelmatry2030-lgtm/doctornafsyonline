import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Bell,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Star,
  Info,
  Megaphone,
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import NotificationsList from "@/components/NotificationsList";

interface NotificationItem {
  id: string;
  type: "appointment" | "system" | "review" | "message" | string;
  title: string;
  description: string;
  time: Date;
  icon: React.ReactNode;
  color: string;
}

export default async function PatientNotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Fetch recent appointments for notifications
  const recentAppointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { therapist: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Fetch system notifications
  const systemNotifications = await prisma.systemNotification.findMany({
    where: {
      target: { in: ["ALL", "PATIENTS"] },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Build notification items from different sources
  const notifications: any[] = [];

  // Add appointment notifications
  recentAppointments.forEach((app) => {
    if (app.status === "CONFIRMED" || app.status === "IN_PROGRESS") {
      notifications.push({
        id: `app-confirmed-${app.id}`,
        type: "appointment",
        title: app.status === "IN_PROGRESS" ? "الجلسة جارية الآن" : "تم تأكيد الموعد",
        description: app.status === "IN_PROGRESS" 
          ? `جلسة العلاج مع د. ${app.therapist.name} جارية الآن. يرجى الدخول للغرفة.`
          : `تم تأكيد جلستك مع د. ${app.therapist.name} بتاريخ ${format(new Date(app.scheduledAt), "d MMMM yyyy", { locale: arSA })}`,
        time: new Date(app.updatedAt),
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: "text-green-500 bg-green-50",
        href: `/session/${app.id}`,
      });
    } else if (app.status === "CANCELLED") {
      notifications.push({
        id: `app-cancelled-${app.id}`,
        type: "appointment",
        title: "تم إلغاء الموعد",
        description: `تم إلغاء جلستك مع د. ${app.therapist.name}`,
        time: new Date(app.updatedAt),
        icon: <Info className="w-5 h-5" />,
        color: "text-red-500 bg-red-50",
        href: "/patient/appointments",
      });
    } else if (app.status === "COMPLETED") {
      notifications.push({
        id: `app-completed-${app.id}`,
        type: "appointment",
        title: "اكتملت الجلسة",
        description: `تمت جلستك مع د. ${app.therapist.name} بنجاح. لا تنسَ تقييم تجربتك!`,
        time: new Date(app.updatedAt),
        icon: <Star className="w-5 h-5" />,
        color: "text-amber-500 bg-amber-50",
        href: "/patient/reviews",
      });
    } else if (app.status === "PENDING") {
      notifications.push({
        id: `app-pending-${app.id}`,
        type: "appointment",
        title: "موعد جديد بانتظار التأكيد",
        description: `تم حجز موعد مع د. ${app.therapist.name}، بانتظار تأكيد الأخصائي.`,
        time: new Date(app.createdAt),
        icon: <Calendar className="w-5 h-5" />,
        color: "text-indigo-500 bg-indigo-50",
        href: "/patient/billing",
      });
    }
  });

  // Add system notifications
  systemNotifications.forEach((notif) => {
    notifications.push({
      id: `sys-${notif.id}`,
      type: "system",
      title: notif.title,
      description: notif.message,
      time: new Date(notif.createdAt),
      icon: <Megaphone className="w-5 h-5" />,
      color: "text-purple-500 bg-purple-50",
    });
  });

  // Sort by time (newest first)
  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-indigo-500" />
          الإشعارات
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          تابع آخر المستجدات والتحديثات الخاصة بحسابك
        </p>
      </div>

      <NotificationsList
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          description: n.description,
          time: n.time.toISOString(),
          color: n.color,
          href: n.href,
        }))}
      />
    </div>
  );
}
