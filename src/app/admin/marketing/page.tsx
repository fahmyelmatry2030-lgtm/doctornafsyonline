"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Bell, Send, CheckCircle } from "lucide-react";

type PromoCode = {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
};

type Ticket = {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function MarketingPage() {
  const [tab, setTab] = useState<"promos" | "support" | "notifications">("promos");
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", discount: 10, expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [respondingSaving, setRespondingSaving] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("ALL");
  const [notifForm, setNotifForm] = useState({ title: "", message: "", target: "ALL" });
  const [notifSent, setNotifSent] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [proRes, tkRes] = await Promise.all([
      fetch("/api/admin/promos"),
      fetch("/api/admin/support"),
    ]);
    if (proRes.ok) setPromos(await proRes.json());
    if (tkRes.ok) setTickets(await tkRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = "NAFSI-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPromoForm(f => ({ ...f, code }));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/promos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(promoForm) });
    setSaving(false);
    setShowPromoForm(false);
    setPromoForm({ code: "", discount: 10, expiresAt: "" });
    load();
  };

  const togglePromo = async (id: string, current: boolean) => {
    await fetch("/api/admin/promos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !current }) });
    load();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("حذف هذا الكود؟")) return;
    await fetch("/api/admin/promos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const respondTicket = async (id: string) => {
    setRespondingSaving(true);
    await fetch("/api/admin/support", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, response, status: "RESOLVED" }) });
    setRespondingSaving(false);
    setActiveTicket(null);
    setResponse("");
    load();
  };

  const closeTicket = async (id: string) => {
    await fetch("/api/admin/support", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "CLOSED" }) });
    load();
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaving(true);
    await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notifForm) });
    setNotifSaving(false);
    setNotifSent(true);
    setNotifForm({ title: "", message: "", target: "ALL" });
    setTimeout(() => setNotifSent(false), 3000);
  };

  const filteredTickets = ticketFilter === "ALL" ? tickets : tickets.filter(t => t.status === ticketFilter);
  const statusColor: Record<string, string> = { OPEN: "bg-amber-100 text-amber-700", RESOLVED: "bg-green-100 text-green-700", CLOSED: "bg-slate-100 text-slate-500" };
  const statusLabel: Record<string, string> = { OPEN: "مفتوحة", RESOLVED: "محلولة", CLOSED: "مغلقة" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">التسويق والدعم الفني</h1>
        <p className="text-slate-500 mt-1">إدارة أكواد الخصم، تذاكر الدعم، وإشعارات النظام</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: "promos", label: "أكواد الخصم", icon: <Tag className="w-4 h-4" /> },
          { id: "support", label: "الدعم الفني", icon: <X className="w-4 h-4" /> },
          { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as "promos" | "support" | "notifications")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.icon} {t.label}
            {t.id === "support" && tickets.filter(tk => tk.status === "OPEN").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tickets.filter(tk => tk.status === "OPEN").length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "promos" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowPromoForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-900/20">
              <Plus className="w-4 h-4" /> كود خصم جديد
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promos.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-slate-400">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">لا توجد أكواد خصم بعد.</p>
              </div>
            ) : promos.map(p => (
              <div key={p.id} className={`glass rounded-2xl border p-5 transition-all ${p.isActive ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800 font-mono tracking-widest">{p.code}</span>
                      <button onClick={() => copyCode(p.code, p.id)} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                        {copiedId === p.id ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">ينتهي: {new Date(p.expiresAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">{p.discount}%</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                  <button onClick={() => togglePromo(p.id, p.isActive)} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg transition-colors ${p.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                    {p.isActive ? <><ToggleRight className="w-4 h-4" /> إيقاف</> : <><ToggleLeft className="w-4 h-4" /> تفعيل</>}
                  </button>
                  <button onClick={() => deletePromo(p.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 font-bold hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "support" ? (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {["ALL", "OPEN", "RESOLVED", "CLOSED"].map(s => (
              <button key={s} onClick={() => setTicketFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${ticketFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s === "ALL" ? "الكل" : statusLabel[s]}
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl border border-[var(--color-border-soft)] overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-16 text-slate-400"><p className="font-semibold">لا توجد تذاكر دعم.</p></div>
              ) : filteredTickets.map(t => (
                <div key={t.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                        <h3 className="font-bold text-sm text-slate-800">{t.subject}</h3>
                      </div>
                      <p className="text-xs text-slate-500">{t.userName} · {t.userEmail}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{t.message}</p>
                      {t.response && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">ردنا: {t.response}</p>}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString("ar-EG")}</p>
                      {t.status === "OPEN" && (
                        <button onClick={() => { setActiveTicket(t); setResponse(t.response || ""); }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
                          رد
                        </button>
                      )}
                      {t.status !== "CLOSED" && (
                        <button onClick={() => closeTicket(t.id)} className="text-xs text-slate-500 hover:text-red-500 font-semibold transition-colors">إغلاق</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="glass rounded-3xl border border-[var(--color-border-soft)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl"><Bell className="w-6 h-6 text-indigo-600" /></div>
              <div>
                <h2 className="font-black text-slate-800 text-lg">إرسال إشعار للمستخدمين</h2>
                <p className="text-slate-500 text-sm">سيظهر الإشعار في لوحة التحكم لجميع المستخدمين المحددين</p>
              </div>
            </div>
            {notifSent && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 mb-4 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" /> تم إرسال الإشعار بنجاح!
              </div>
            )}
            <form onSubmit={sendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">الجمهور المستهدف</label>
                <select value={notifForm.target} onChange={e => setNotifForm(f => ({ ...f, target: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  <option value="ALL">الجميع</option>
                  <option value="PATIENTS">المرضى فقط</option>
                  <option value="THERAPISTS">الأخصائيون فقط</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">عنوان الإشعار</label>
                <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="مثال: تحديث جديد في المنصة" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">نص الإشعار</label>
                <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))} required rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="اكتب محتوى الإشعار هنا..." />
              </div>
              <button type="submit" disabled={notifSaving}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-indigo-900/20 disabled:opacity-60">
                <Send className="w-4 h-4" /> {notifSaving ? "جارٍ الإرسال..." : "إرسال الإشعار"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Promo Form Modal */}
      {showPromoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-slate-900 text-lg">إنشاء كود خصم جديد</h2>
              <button onClick={() => setShowPromoForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={createPromo} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">الكود</label>
                <div className="flex gap-2">
                  <input value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase" placeholder="NAFSI-XXXX" />
                  <button type="button" onClick={generateCode} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors">توليد</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">نسبة الخصم ({promoForm.discount}%)</label>
                <input type="range" min={5} max={80} step={5} value={promoForm.discount} onChange={e => setPromoForm(f => ({ ...f, discount: Number(e.target.value) }))}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5%</span><span className="font-bold text-indigo-600 text-sm">{promoForm.discount}%</span><span>80%</span></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ الانتهاء</label>
                <input type="date" value={promoForm.expiresAt} onChange={e => setPromoForm(f => ({ ...f, expiresAt: e.target.value }))} required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                  {saving ? "جارٍ الإنشاء..." : "إنشاء الكود"}
                </button>
                <button type="button" onClick={() => setShowPromoForm(false)} className="px-5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Ticket Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-slate-900 text-lg">الرد على التذكرة</h2>
              <button onClick={() => setActiveTicket(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="font-bold text-slate-800 text-sm mb-1">{activeTicket.subject}</p>
              <p className="text-sm text-slate-500 mb-2">{activeTicket.userName} · {activeTicket.userEmail}</p>
              <p className="text-sm text-slate-700">{activeTicket.message}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ردك</label>
                <textarea value={response} onChange={e => setResponse(e.target.value)} rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  placeholder="اكتب ردك هنا..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => respondTicket(activeTicket.id)} disabled={respondingSaving || !response}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {respondingSaving ? "جارٍ الإرسال..." : "إرسال الرد"}
                </button>
                <button onClick={() => setActiveTicket(null)} className="px-5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
