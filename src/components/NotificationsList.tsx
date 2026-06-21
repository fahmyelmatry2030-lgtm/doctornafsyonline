"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, CheckCircle2, Info, Star, Megaphone, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "appointment" | "system" | "review" | "message" | string;
  title: string;
  description: string;
  time: string | Date;
  icon?: React.ReactNode;
  color: string;
  href?: string;
}

export default function NotificationsList({ initialNotifications, userId = null }: { initialNotifications: NotificationItem[]; userId?: string | null }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const storageKey = userId ? `dismissedNotifications_${userId}` : "dismissedNotifications";

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved));
      } catch (e) {}
    } else {
      setDismissedIds([]);
    }
  }, [storageKey]);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    const allIds = initialNotifications.map(n => n.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  if (!isMounted) {
    // Return placeholder/spinner on server/first paint to prevent hydration mismatch
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeNotifications = initialNotifications.filter(n => !dismissedIds.includes(n.id));

  const formatTimeAgo = (timeVal: string | Date) => {
    const date = new Date(timeVal);
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

  const getIcon = (type: string) => {
    if (type === "system") return <Megaphone className="w-5 h-5" />;
    if (type === "appointment") return <CheckCircle2 className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {activeNotifications.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all border border-red-200"
          >
            مسح جميع الإشعارات
          </button>
        </div>
      )}

      {activeNotifications.length === 0 ? (
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-16 text-center bg-white">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Bell className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-xl font-bold text-slate-700">لا توجد إشعارات</p>
          <p className="text-sm text-slate-400 mt-2">
            ستظهر هنا آخر التحديثات والأحداث المتعلقة بحسابك
          </p>
        </div>
      ) : (
        <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] overflow-hidden bg-white">
          <div className="divide-y divide-slate-100">
            {activeNotifications.map((notif, index) => (
              <div
                key={notif.id}
                className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}
                >
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    {notif.href ? (
                      <Link href={notif.href} className="hover:underline">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {notif.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-bold text-slate-800 text-sm">
                        {notif.title}
                      </h3>
                    )}
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {formatTimeAgo(notif.time)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notif.id)}
                  className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 self-center border border-transparent hover:border-red-150 shrink-0"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
