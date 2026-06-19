"use client";

import { useState } from "react";
import { Settings, Percent, Globe, Key, Bell, Shield, CheckCircle, ChevronLeft, Loader2, Eye } from "lucide-react";
import { getSettings, updateSettings } from "./actions";

type SiteSettings = Awaited<ReturnType<typeof getSettings>>;

export function SettingsPageClient({
  initialSettings,
  isReadOnly = false,
}: {
  initialSettings: SiteSettings;
  isReadOnly?: boolean;
}) {
  // Filter out API section for ADMIN_VIEWER (they can't see API keys)
  const allSections = [
    { id: "financial", label: "الإعدادات المالية", icon: <Percent className="w-4 h-4" /> },
    { id: "platform", label: "إعدادات المنصة", icon: <Globe className="w-4 h-4" /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "الأمان", icon: <Shield className="w-4 h-4" /> },
    ...(!isReadOnly ? [{ id: "api", label: "مفاتيح API", icon: <Key className="w-4 h-4" /> }] : []),
  ];

  const [active, setActive] = useState("financial");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [commission, setCommission] = useState(initialSettings.commission);
  const [minPrice, setMinPrice] = useState(initialSettings.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialSettings.maxPrice);
  const [sessionDuration, setSessionDuration] = useState(initialSettings.sessionDuration);
  const [platformName, setPlatformName] = useState(initialSettings.platformName);
  const [allowNewTherapists, setAllowNewTherapists] = useState(initialSettings.allowNewTherapists);
  const [allowNewPatients, setAllowNewPatients] = useState(initialSettings.allowNewPatients);
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenanceMode);
  const [emailOnBooking, setEmailOnBooking] = useState(initialSettings.emailOnBooking);
  const [emailOnCancel, setEmailOnCancel] = useState(initialSettings.emailOnCancel);
  const [smsEnabled, setSmsEnabled] = useState(initialSettings.smsEnabled);
  const [twoFactor, setTwoFactor] = useState(initialSettings.twoFactor);
  const [sessionTimeout, setSessionTimeout] = useState(initialSettings.sessionTimeout);
  const [stripeKey] = useState(initialSettings.stripeKey);
  const [livekitKey] = useState(initialSettings.livekitKey);
  const [livekitUrl] = useState(initialSettings.livekitUrl);

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      await updateSettings({
        commission, minPrice, maxPrice, sessionDuration,
        platformName, allowNewTherapists, allowNewPatients,
        maintenanceMode, emailOnBooking, emailOnCancel,
        smsEnabled, twoFactor, sessionTimeout,
        stripeKey, livekitKey, livekitUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  // Shared input class (disabled when read-only)
  const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isReadOnly ? "bg-slate-50 cursor-not-allowed text-slate-500" : "bg-white"}`;

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إعدادات النظام</h1>
          <p className="text-slate-500 mt-1">
            {isReadOnly ? "عرض إعدادات وتكوين المنصة" : "التحكم الكامل في إعدادات وتكوين المنصة"}
          </p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold shrink-0">
            <Eye className="w-4 h-4" />
            عرض فقط — لا يمكن التعديل
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
          <CheckCircle className="w-4 h-4" /> تم حفظ الإعدادات بنجاح!
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 shrink-0 space-y-1">
          {allSections.map(s => (
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
                    <input
                      type="range" min={5} max={40} value={commission}
                      onChange={e => !isReadOnly && setCommission(Number(e.target.value))}
                      disabled={isReadOnly}
                      className={`w-full accent-indigo-600 ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>5%</span>
                      <span className="font-black text-indigo-600 text-base">{commission}%</span>
                      <span>40%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">مدة الجلسة الافتراضية (دقيقة)</label>
                  <select value={sessionDuration}
                    onChange={e => !isReadOnly && setSessionDuration(Number(e.target.value))}
                    disabled={isReadOnly}
                    className={inputCls}>
                    {[30, 45, 50, 60, 75, 90].map(d => <option key={d} value={d}>{d} دقيقة</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأدنى لسعر الجلسة (ج.م)</label>
                  <input type="number" value={minPrice}
                    onChange={e => !isReadOnly && setMinPrice(Number(e.target.value))}
                    disabled={isReadOnly} min={50} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأقصى لسعر الجلسة (ج.م)</label>
                  <input type="number" value={maxPrice}
                    onChange={e => !isReadOnly && setMaxPrice(Number(e.target.value))}
                    disabled={isReadOnly} min={200} className={inputCls} />
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
                  <input value={platformName}
                    onChange={e => !isReadOnly && setPlatformName(e.target.value)}
                    disabled={isReadOnly} className={inputCls} />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "السماح بتسجيل أخصائيين جدد", desc: "عند الإيقاف، لن يتمكن أخصائيون جدد من إنشاء حسابات", value: allowNewTherapists, set: setAllowNewTherapists },
                    { label: "السماح بتسجيل مرضى جدد", desc: "عند الإيقاف، يصبح الموقع مغلقاً للتسجيل", value: allowNewPatients, set: setAllowNewPatients },
                    { label: "وضع الصيانة", desc: "إيقاف المنصة مؤقتاً وعرض رسالة صيانة للمستخدمين", value: maintenanceMode, set: setMaintenanceMode },
                  ].map(toggle => (
                    <label key={toggle.label} className={`flex items-start gap-4 p-4 border border-slate-200 rounded-xl transition-colors ${isReadOnly ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-slate-50"}`}>
                      <div className="relative mt-0.5">
                        <input type="checkbox" className="sr-only" checked={toggle.value}
                          onChange={e => !isReadOnly && toggle.set(e.target.checked)}
                          disabled={isReadOnly} />
                        <div className={`w-11 h-6 rounded-full transition-colors ${toggle.value ? "bg-indigo-600" : "bg-slate-200"}`}>
                          <div className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? "-translate-x-5" : "translate-x-0"}`} />
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
                  <label key={toggle.label} className={`flex items-start gap-4 p-4 border border-slate-200 rounded-xl transition-colors ${isReadOnly ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-slate-50"}`}>
                    <div className="relative mt-0.5">
                      <input type="checkbox" className="sr-only" checked={toggle.value}
                        onChange={e => !isReadOnly && toggle.set(e.target.checked)}
                        disabled={isReadOnly} />
                      <div className={`w-11 h-6 rounded-full transition-colors ${toggle.value ? "bg-indigo-600" : "bg-slate-200"}`}>
                        <div className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? "-translate-x-5" : "translate-x-0"}`} />
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
                <label className={`flex items-start gap-4 p-4 border border-slate-200 rounded-xl transition-colors ${isReadOnly ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-slate-50"}`}>
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="sr-only" checked={twoFactor}
                      onChange={e => !isReadOnly && setTwoFactor(e.target.checked)}
                      disabled={isReadOnly} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-indigo-600" : "bg-slate-200"}`}>
                      <div className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${twoFactor ? "-translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">إلزام المصادقة الثنائية (2FA)</p>
                    <p className="text-xs text-slate-500 mt-0.5">طلب رمز تحقق إضافي عند تسجيل الدخول للمديرين</p>
                  </div>
                </label>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">مهلة انتهاء الجلسة (دقيقة)</label>
                  <input type="number" value={sessionTimeout}
                    onChange={e => !isReadOnly && setSessionTimeout(Number(e.target.value))}
                    disabled={isReadOnly} min={5} max={120}
                    className={`${inputCls} max-w-xs`} />
                  <p className="text-xs text-slate-400 mt-1">يتم تسجيل الخروج تلقائياً بعد فترة الخمول المحددة</p>
                </div>
              </div>
            </>
          )}

          {/* API section - only visible to ADMIN (not ADMIN_VIEWER) */}
          {active === "api" && !isReadOnly && (
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

          {/* Save button - hidden for ADMIN_VIEWER */}
          {!isReadOnly && (
            <div className="pt-4 border-t border-slate-100">
              <button onClick={handleSave} disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                حفظ التعديلات
              </button>
            </div>
          )}

          {/* Read-only notice at bottom */}
          {isReadOnly && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 px-4 py-3 rounded-xl text-sm font-medium">
                <Eye className="w-4 h-4 shrink-0" />
                أنت في وضع العرض فقط. لا يمكنك تعديل الإعدادات.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
