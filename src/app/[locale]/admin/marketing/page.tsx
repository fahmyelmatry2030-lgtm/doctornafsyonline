"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Bell, Send, CheckCircle } from "lucide-react";

type PromoCode = {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
};



export default function MarketingPage() {
  const { data: session } = useSession();
  const isReadOnly = session?.user?.role === "ADMIN_VIEWER";
  const [tab, setTab] = useState<"promos" | "notifications">("promos");
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", discount: 10, expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", target: "ALL" });
  const [notifSent, setNotifSent] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const proRes = await fetch("/api/admin/promos");
    if (proRes.ok) setPromos(await proRes.json());
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


  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaving(true);
    await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notifForm) });
    setNotifSaving(false);
    setNotifSent(true);
    setNotifForm({ title: "", message: "", target: "ALL" });
    setTimeout(() => setNotifSent(false), 3000);
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">التسويق والدعم الفني</h1>
          <p className="text-slate-500 mt-1">إدارة أكواد الخصم، تذاكر الدعم، وإشعارات النظام</p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
            🔍 عرض فقط — لا يمكن التعديل
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: "promos", label: "أكواد الخصم", icon: <Tag className="w-4 h-4" /> },
          { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as "promos" | "notifications")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.icon} {t.label}
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
            {!isReadOnly && (
              <button onClick={() => setShowPromoForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-900/20">
                <Plus className="w-4 h-4" /> كود خصم جديد
              </button>
            )}
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
                  {!isReadOnly ? (
                    <>
                      <button onClick={() => togglePromo(p.id, p.isActive)} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg transition-colors ${p.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                        {p.isActive ? <><ToggleRight className="w-4 h-4" /> إيقاف</> : <><ToggleLeft className="w-4 h-4" /> تفعيل</>}
                      </button>
                      <button onClick={() => deletePromo(p.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 font-bold hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" /> حذف
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 text-center text-xs text-slate-400 py-1.5 font-medium">عرض فقط</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isReadOnly ? (
        <div className="max-w-xl mx-auto">
          <div className="glass rounded-3xl border border-[var(--color-border-soft)] p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold">لا يمكنك إرسال إشعارات بصلاحية العرض فقط.</p>
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


    </div>
  );
}
