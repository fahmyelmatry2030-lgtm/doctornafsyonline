"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { Loader2, Search, Activity, Clock, ShieldCheck, User as UserIcon } from "lucide-react";

type StaffPresence = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isOnline: boolean;
  lastActivityAt: string;
  isSuspended: boolean;
};

const getRoleLabel = (roleStr: string) => {
  if (roleStr === "ADMIN") return { label: "مدير عام", color: "bg-purple-100 text-purple-700 border-purple-200" };
  if (roleStr === "ADMIN_HR") return { label: "مدير موارد بشرية", color: "bg-indigo-100 text-indigo-700 border-indigo-200" };
  if (roleStr === "ADMIN_ACCOUNTING") return { label: "مدير حسابات", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (roleStr === "ADMIN_VIEWER") return { label: "مراقب", color: "bg-amber-100 text-amber-700 border-amber-200" };
  if (roleStr === "SHIFT_LEADER") return { label: "قائد شيفت", color: "bg-blue-100 text-blue-700 border-blue-200" };
  if (roleStr === "ADMIN_MARKETING") return { label: "مبيعات وتسويق", color: "bg-rose-100 text-rose-700 border-rose-200" };
  if (roleStr === "ADMIN_CUSTOMER_SERVICE") return { label: "خدمة العملاء", color: "bg-cyan-100 text-cyan-700 border-cyan-200" };
  if (roleStr === "THERAPIST") return { label: "أخصائي", color: "bg-teal-100 text-teal-700 border-teal-200" };
  return { label: roleStr, color: "bg-slate-100 text-slate-700 border-slate-200" };
};

export function ActivityLog() {
  const [users, setUsers] = useState<StaffPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPresence = async () => {
    try {
      const res = await fetch("/api/admin/presence");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresence();
    const interval = setInterval(fetchPresence, 60000); // refresh every 1 minute
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getRoleLabel(u.role).label.includes(searchQuery)
  );

  const onlineCount = users.filter(u => u.isOnline).length;
  const offlineCount = users.length - onlineCount;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">إجمالي فريق العمل</p>
            <p className="text-2xl font-black text-slate-800">{users.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">متصل الآن</p>
            <p className="text-2xl font-black text-emerald-600">{onlineCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">غير متصل</p>
            <p className="text-2xl font-black text-slate-600">{offlineCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <div>
              <h2 className="text-xl font-bold text-[#2B3674]">مراقبة التواجد والنشاط</h2>
              <p className="text-xs text-slate-400 mt-1">
                تحديث تلقائي كل دقيقة. آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EG")}
              </p>
            </div>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد أو المنصب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-indigo-500 transition-colors bg-slate-50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">الموظف</th>
                  <th className="px-5 py-4">المنصب</th>
                  <th className="px-5 py-4 text-center">الحالة</th>
                  <th className="px-5 py-4 text-center">آخر ظهور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => {
                  const roleInfo = getRoleLabel(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img 
                              src={encodeURI(decodeURI(u.avatar))} 
                              alt={u.name} 
                              className="w-10 h-10 rounded-full object-cover shrink-0" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `<div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">${u.name.charAt(0)}</div>`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              {u.name}
                              {u.isSuspended && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">موقوف</span>}
                            </div>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            متصل الآن
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            غير متصل
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-500 text-xs font-medium" dir="ltr">
                        {u.isOnline ? (
                          <span className="text-emerald-500 font-bold">نشط</span>
                        ) : (
                          formatDistanceToNow(new Date(u.lastActivityAt), { addSuffix: true, locale: arSA })
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium">
                لا يوجد نتائج مطابقة للبحث
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
