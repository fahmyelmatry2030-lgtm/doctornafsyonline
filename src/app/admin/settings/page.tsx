"use client";

import { useState, useEffect } from "react";
import { Settings, Percent, Globe, Key, Bell, Shield, CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { getSettings, updateSettings } from "./actions";

const sections = [
  { id: "financial", label: "الإعدادات المالية", icon: <Percent className="w-4 h-4" /> },
  { id: "platform", label: "إعدادات المنصة", icon: <Globe className="w-4 h-4" /> },
  { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "الأمان", icon: <Shield className="w-4 h-4" /> },
  { id: "api", label: "مفاتيح API", icon: <Key className="w-4 h-4" /> },
];

export default function AdminSettingsPage() {
  const [active, setActive] = useState("financial");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [commission, setCommission] = useState(20);
  const [minPrice, setMinPrice] = useState(100);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sessionDuration, setSessionDuration] = useState(50);
  const [platformName, setPlatformName] = useState("دكتور نفسي");
  const [allowNewTherapists, setAllowNewTherapists] = useState(true);
  const [allowNewPatients, setAllowNewPatients] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailOnBooking, setEmailOnBooking] = useState(true);
  const [emailOnCancel, setEmailOnCancel] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [stripeKey, setStripeKey] = useState("sk_test_***");
  const [livekitKey, setLivekitKey] = useState("lk_secret_***");
  const [livekitUrl, setLivekitUrl] = useState("wss://your-livekit.livekit.cloud");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSettings();
        setCommission(settings.commission);
        setMinPrice(settings.minPrice);
        setMaxPrice(settings.maxPrice);
        setSessionDuration(settings.sessionDuration);
        setPlatformName(settings.platformName);
        setAllowNewTherapists(settings.allowNewTherapists);
        setAllowNewPatients(settings.allowNewPatients);
        setMaintenanceMode(settings.maintenanceMode);
        setEmailOnBooking(settings.emailOnBooking);
        setEmailOnCancel(settings.emailOnCancel);
        setSmsEnabled(settings.smsEnabled);
        setTwoFactor(settings.twoFactor);
        setSessionTimeout(settings.sessionTimeout);
        setStripeKey(settings.stripeKey);
        setLivekitKey(settings.livekitKey);
        setLivekitUrl(settings.livekitUrl);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        commission,
        minPrice,
        maxPrice,
        sessionDuration,
        platformName,
        allowNewTherapists,
        allowNewPatients,
        maintenanceMode,
        emailOnBooking,
        emailOnCancel,
        smsEnabled,
        twoFactor,
        sessionTimeout,
        stripeKey,
        livekitKey,
        livekitUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-semibold text-sm">جاري تحميل إعدادات النظام...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إعدادات النظام</h1>
        <p className="text-slate-500 mt-1">التحكم الكامل في إعدادات وتكوين المنصة</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
          <CheckCircle className="w-4 h-4" /> تم حفظ الإعدادات بنجاح!
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 shrink-0 space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active === s.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" : "text-slate-600 hover:bg-slate-100"
              }`}>
              <span className="flex items-center gap-2">{s.icon} {s.label}</span>
              {active === s.id && <ChevronLeft className="w-4 h-4 opacity-70" />}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 glass rounded-3xl border border-[var(--color-border-soft)] p-8 space-y-6">

          {active === "financial" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-500" /> الإعدادات المالية
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">نسبة عمولة المنصة (%)</label>
                  <div className="space-y-2">
                    <input type="range" min={5} max={40} value={commission} onChange={e => setCommission(Number(e.target.value))} className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>5%</span><span className="font-black text-indigo-600 text-base">{commission}%</span><span>40%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">مدة الجلسة الافتراضية (دقيقة)</label>
                  <select value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    {[30, 45, 50, 60, 75, 90].map(d => <option key={d} value={d}>{d} دقيقة</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأدنى لسعر الجلسة (ج.م)</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} min={50}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأقصى لسعر الجلسة (ج.م)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} min={200}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-indigo-700 font-semibold">ملاحظة: حصة الأخصائي = {100 - commission}% · حصة المنصة = {commission}%</p>
              </div>
            </>
          )}

          {active === "platform" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> إعدادات المنصة
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المنصة</label>
                  <input value={platformName} onChange={e => setPlatformName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "السماح بتسجيل أخصائيين جدد", desc: "عند الإيقاف، لن يتمكن أخصائيون جدد من إنشاء حسابات", value: allowNewTherapists, set: setAllowNewTherapists },
                    { label: "السماح بتسجيل مرضى جدد", desc: "عند الإيقاف، يصبح الموقع مغلقاً للتسجيل", value: allowNewPatients, set: setAllowNewPatients },
                    { label: "وضع الصيانة", desc: "إيقاف المنصة مؤقتاً وعرض رسالة صيانة للمستخدمين", value: maintenanceMode, set: setMaintenanceMode },
                  ].map(toggle => (
                    <label key={toggle.label} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="relative mt-0.5">
                        <input type="checkbox" className="sr-only" checked={toggle.value} onChange={e => toggle.set(e.target.checked)} />
                        <div className={`w-11 h-6 rounded-full transition-colors ${toggle.value ? "bg-indigo-600" : "bg-slate-200"}`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{toggle.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{toggle.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {active === "notifications" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> إعدادات الإشعارات
              </h2>
              <div className="space-y-3">
                {[
                  { label: "إشعار بريدي عند الحجز", desc: "إرسال بريد للمريض والأخصائي عند تأكيد الحجز", value: emailOnBooking, set: setEmailOnBooking },
                  { label: "إشعار بريدي عند الإلغاء", desc: "إرسال بريد عند إلغاء أي موعد", value: emailOnCancel, set: setEmailOnCancel },
                  { label: "رسائل SMS", desc: "إرسال تذكيرات بالرسائل القصيرة (يتطلب اشتراكاً)", value: smsEnabled, set: setSmsEnabled },
                ].map(toggle => (
                  <label key={toggle.label} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="relative mt-0.5">
                      <input type="checkbox" className="sr-only" checked={toggle.value} onChange={e => toggle.set(e.target.checked)} />
                      <div className={`w-11 h-6 rounded-full transition-colors ${toggle.value ? "bg-indigo-600" : "bg-slate-200"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{toggle.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{toggle.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {active === "security" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> إعدادات الأمان
              </h2>
              <div className="space-y-5">
                <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="sr-only" checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-indigo-600" : "bg-slate-200"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${twoFactor ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">إلزام المصادقة الثنائية (2FA)</p>
                    <p className="text-xs text-slate-500 mt-0.5">طلب رمز تحقق إضافي عند تسجيل الدخول للمديرين</p>
                  </div>
                </label>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">مهلة انتهاء الجلسة (دقيقة)</label>
                  <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} min={5} max={120}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 max-w-xs" />
                  <p className="text-xs text-slate-400 mt-1">يتم تسجيل الخروج تلقائياً بعد فترة الخمول المحددة</p>
                </div>
              </div>
            </>
          )}

          {active === "api" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" /> مفاتيح الربط الخارجية
              </h2>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  🔒 لأسباب أمنية، يتم قراءة مفاتيح الربط الحساسة مباشرة من ملف البيئة البرمجية <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">.env</code> على الخادم.
                </div>
                {[
                  { label: "Stripe Secret Key", value: stripeKey === "sk_test_***" ? "" : stripeKey, placeholder: "معرف بملف البيئة (STRIPE_SECRET_KEY)" },
                  { label: "LiveKit Secret Key", value: livekitKey === "lk_secret_***" ? "" : livekitKey, placeholder: "معرف بملف البيئة (LIVEKIT_API_SECRET)" },
                  { label: "LiveKit Server URL", value: livekitUrl === "wss://your-livekit.livekit.cloud" ? "" : livekitUrl, placeholder: "معرف بملف البيئة (LIVEKIT_URL)" },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{field.label}</label>
                    <input type="text" disabled value={field.value ? "••••••••••••••••" : ""} placeholder={field.placeholder}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none bg-slate-50 text-slate-400 cursor-not-allowed" />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button onClick={handleSave} disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
