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

interface NotificationItem {
  id: string;
  type: "appointment" | "system" | "review" | "message";
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
  const notifications: NotificationItem[] = [];

  // Add appointment notifications
  recentAppointments.forEach((app) => {
    if (app.status === "CONFIRMED") {
      notifications.push({
        id: `app-confirmed-${app.id}`,
        type: "appointment",
        title: "تم تأكيد الموعد",
        description: `تم تأكيد جلستك مع د. ${app.therapist.name} بتاريخ ${format(new Date(app.scheduledAt), "d MMMM yyyy", { locale: arSA })}`,
        time: new Date(app.updatedAt),
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: "text-green-500 bg-green-50",
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return format(date, "d MMMM yyyy", { locale: arSA });
  };

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

      {notifications.length === 0 ? (
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Bell className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-xl font-bold text-slate-700">لا توجد إشعارات</p>
          <p className="text-sm text-slate-400 mt-2">
            ستظهر هنا آخر التحديثات والأحداث المتعلقة بحسابك
          </p>
        </div>
      ) : (
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                className="p-5 flex items-start gap-4 hover:bg-white/60 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}
                >
                  {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {formatTimeAgo(notif.time)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
