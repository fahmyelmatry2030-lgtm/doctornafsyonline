"use client";

import { useState, useEffect } from "react";
import { Settings, Percent, Globe, Key, Bell, Shield, CheckCircle, ChevronLeft, Loader2, Eye, FileText, UploadCloud, AlertCircle } from "lucide-react";
import { getSettings, updateSettings, getWebsiteContent, updateWebsiteContent, WebsiteContent } from "./actions";

type SiteSettings = Awaited<ReturnType<typeof getSettings>>;

export function SettingsPageClient({
  initialSettings,
  initialContent,
  isReadOnly = false,
}: {
  initialSettings: SiteSettings;
  initialContent: WebsiteContent;
  isReadOnly?: boolean;
}) {
  // Filter out API section for ADMIN_VIEWER (they can't see API keys)
  const allSections = [
    { id: "financial", label: "الإعدادات المالية", icon: <Percent className="w-4 h-4" /> },
    { id: "platform", label: "إعدادات المنصة", icon: <Globe className="w-4 h-4" /> },
    { id: "webcontent", label: "محتوى صفحات الموقع 📝", icon: <FileText className="w-4 h-4" /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "الأمان", icon: <Shield className="w-4 h-4" /> },
    { id: "contracts", label: "نماذج العقود الرسمية 📄", icon: <FileText className="w-4 h-4" /> },
    ...(!isReadOnly ? [{ id: "api", label: "مفاتيح API", icon: <Key className="w-4 h-4" /> }] : []),
  ];

  const [active, setActive] = useState("financial");
  const [subActiveTab, setSubActiveTab] = useState("home");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && allSections.some(s => s.id === tab)) {
        setActive(tab);
      }
    }
  }, []);


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
  const [walletVodafone, setWalletVodafone] = useState(initialSettings.walletVodafone || "");
  const [walletInstapay, setWalletInstapay] = useState(initialSettings.walletInstapay || "");
  const [bankAccount, setBankAccount] = useState(initialSettings.bankAccount || "");
  const [walletVodafoneName, setWalletVodafoneName] = useState(initialSettings.walletVodafoneName || "");
  const [walletInstapayName, setWalletInstapayName] = useState(initialSettings.walletInstapayName || "");
  const [bankName, setBankName] = useState(initialSettings.bankName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings.bankAccountNumber || "");
  const [bankIban, setBankIban] = useState(initialSettings.bankIban || "");
  const [enableAnnualContract, setEnableAnnualContract] = useState(initialSettings.enableAnnualContract ?? false);
  const [currency, setCurrency] = useState(initialSettings.currency || "EGP");

  // Website Content State
  const [homeHeroBadge, setHomeHeroBadge] = useState(initialContent.homeHeroBadge || "");
  const [homeHeroTitle, setHomeHeroTitle] = useState(initialContent.homeHeroTitle || "");
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState(initialContent.homeHeroSubtitle || "");
  const [aboutTitle, setAboutTitle] = useState(initialContent.aboutTitle || "");
  const [aboutSubtitle, setAboutSubtitle] = useState(initialContent.aboutSubtitle || "");
  const [aboutContent, setAboutContent] = useState(initialContent.aboutContent || "");
  const [contactPhone, setContactPhone] = useState(initialContent.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(initialContent.contactEmail || "");
  const [contactAddress, setContactAddress] = useState(initialContent.contactAddress || "");

  // Therapists / Booking
  const [therapistsHeroBadge, setTherapistsHeroBadge] = useState(initialContent.therapistsHeroBadge || "");
  const [therapistsHeroTitle, setTherapistsHeroTitle] = useState(initialContent.therapistsHeroTitle || "");
  const [therapistsHeroTitleGradient, setTherapistsHeroTitleGradient] = useState(initialContent.therapistsHeroTitleGradient || "");
  const [therapistsHeroSubtitle, setTherapistsHeroSubtitle] = useState(initialContent.therapistsHeroSubtitle || "");
  const [therapistsFilterTitle, setTherapistsFilterTitle] = useState(initialContent.therapistsFilterTitle || "");

  // How it works
  const [howItWorksHeroBadge, setHowItWorksHeroBadge] = useState(initialContent.howItWorksHeroBadge || "");
  const [howItWorksHeroTitle, setHowItWorksHeroTitle] = useState(initialContent.howItWorksHeroTitle || "");
  const [howItWorksHeroSubtitle, setHowItWorksHeroSubtitle] = useState(initialContent.howItWorksHeroSubtitle || "");
  const [howItWorksSteps, setHowItWorksSteps] = useState(initialContent.howItWorksSteps || []);
  const [howItWorksFeatures, setHowItWorksFeatures] = useState(initialContent.howItWorksFeatures || []);

  // FAQ
  const [faqHeroBadge, setFaqHeroBadge] = useState(initialContent.faqHeroBadge || "");
  const [faqHeroTitle, setFaqHeroTitle] = useState(initialContent.faqHeroTitle || "");
  const [faqHeroSubtitle, setFaqHeroSubtitle] = useState(initialContent.faqHeroSubtitle || "");
  const [faqItems, setFaqItems] = useState(initialContent.faqItems || []);

  // Terms
  const [termsHeroTitle, setTermsHeroTitle] = useState(initialContent.termsHeroTitle || "");
  const [termsHeroSubtitle, setTermsHeroSubtitle] = useState(initialContent.termsHeroSubtitle || "");
  const [termsSections, setTermsSections] = useState(initialContent.termsSections || []);

  // Privacy
  const [privacyHeroTitle, setPrivacyHeroTitle] = useState(initialContent.privacyHeroTitle || "");
  const [privacyHeroSubtitle, setPrivacyHeroSubtitle] = useState(initialContent.privacyHeroSubtitle || "");
  const [privacySections, setPrivacySections] = useState(initialContent.privacySections || []);

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      if (active === "webcontent") {
        await updateWebsiteContent({
          homeHeroBadge, homeHeroTitle, homeHeroSubtitle,
          aboutTitle, aboutSubtitle, aboutContent,
          contactPhone, contactEmail, contactAddress,
          therapistsHeroBadge, therapistsHeroTitle, therapistsHeroTitleGradient, therapistsHeroSubtitle, therapistsFilterTitle,
          howItWorksHeroBadge, howItWorksHeroTitle, howItWorksHeroSubtitle,
          howItWorksSteps, howItWorksFeatures,
          faqHeroBadge, faqHeroTitle, faqHeroSubtitle,
          faqItems,
          termsHeroTitle, termsHeroSubtitle,
          termsSections,
          privacyHeroTitle, privacyHeroSubtitle,
          privacySections,
        });
      } else {
        await updateSettings({
          commission, minPrice, maxPrice, sessionDuration,
          platformName, allowNewTherapists, allowNewPatients,
          maintenanceMode, emailOnBooking, emailOnCancel,
          smsEnabled, twoFactor, sessionTimeout,
          stripeKey, livekitKey, livekitUrl,
          walletVodafone, walletVodafoneName,
          walletInstapay, walletInstapayName,
          bankName, bankAccountNumber, bankIban,
          bankAccount: `${bankName} - ح/ ${bankAccountNumber} - IBAN: ${bankIban}`,
          enableAnnualContract,
          currency,
        });
      }
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
    <div className="animate-fade-in space-y-6">
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#2B3674]">عملة المنصة الافتراضية</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 bg-[#F4F7FE] border-transparent rounded-xl focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/20 transition-all font-bold text-[#2B3674]"
                    dir="ltr"
                  >
                    <option value="EGP">EGP - جنيه مصري</option>
                    <option value="SAR">SAR - ريال سعودي</option>
                    <option value="USD">USD - دولار أمريكي</option>
                    <option value="AED">AED - درهم إماراتي</option>
                    <option value="KWD">KWD - دينار كويتي</option>
                    <option value="EUR">EUR - يورو</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">نسبة عمولة المنصة (%)</label>
                  <div className="space-y-2">
                    <div className="w-full px-4 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-bold cursor-not-allowed text-center">
                      نسبة العمولة ثابتة (المنصة 40% - الأخصائي 60%)
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
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأدنى لسعر الجلسة ({currency})</label>
                  <input type="number" value={minPrice}
                    onChange={e => !isReadOnly && setMinPrice(Number(e.target.value))}
                    disabled={isReadOnly} min={50} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الحد الأقصى لسعر الجلسة ({currency})</label>
                  <input type="number" value={maxPrice}
                    onChange={e => !isReadOnly && setMaxPrice(Number(e.target.value))}
                    disabled={isReadOnly} min={200} className={inputCls} />
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-md font-black text-slate-800 mb-4">بيانات الدفع والتحويلات للمنصة</h3>
                <div className="space-y-6">
                  {/* Vodafone Cash & InstaPay Details */}
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Vodafone Cash */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">📱 محفظة فودافون/اتصالات كاش للمنصة</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">رقم المحفظة</label>
                          <input type="text" value={walletVodafone}
                            onChange={e => !isReadOnly && setWalletVodafone(e.target.value)}
                            disabled={isReadOnly} placeholder="مثال: 01010423661" className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">الاسم المسجل (لتأكيد التحويل)</label>
                          <input type="text" value={walletVodafoneName}
                            onChange={e => !isReadOnly && setWalletVodafoneName(e.target.value)}
                            disabled={isReadOnly} placeholder="الاسم الكامل كما يظهر في كاش" className={inputCls} />
                        </div>
                      </div>
                    </div>

                    {/* InstaPay */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">💸 حساب إنستاباي للمنصة (InstaPay IPN)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">عنوان التحويل (IPA)</label>
                          <input type="text" value={walletInstapay}
                            onChange={e => !isReadOnly && setWalletInstapay(e.target.value)}
                            disabled={isReadOnly} placeholder="مثال: name@instapay" className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">الاسم المسجل في إنستاباي</label>
                          <input type="text" value={walletInstapayName}
                            onChange={e => !isReadOnly && setWalletInstapayName(e.target.value)}
                            disabled={isReadOnly} placeholder="الاسم الكامل المسجل في التطبيق" className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">🏦 الحساب البنكي للمنصة</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">اسم البنك</label>
                        <input type="text" value={bankName}
                          onChange={e => !isReadOnly && setBankName(e.target.value)}
                          disabled={isReadOnly} placeholder="مثال: البنك الأهلي المصري" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">رقم الحساب</label>
                        <input type="text" value={bankAccountNumber}
                          onChange={e => !isReadOnly && setBankAccountNumber(e.target.value)}
                          disabled={isReadOnly} placeholder="مثال: 1234567890123456" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">رقم الآيبان (IBAN)</label>
                        <input type="text" value={bankIban}
                          onChange={e => !isReadOnly && setBankIban(e.target.value)}
                          disabled={isReadOnly} placeholder="مثال: EG123456789012345678901234567" className={inputCls} />
                      </div>
                    </div>
                  </div>
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
                    { label: "تفعيل العقد السنوي للأخصائيين", desc: "عند الإيقاف، لن يظهر خيار العقد السنوي في حسابات الأخصائيين ولا يمكنهم رفعه", value: enableAnnualContract, set: setEnableAnnualContract },
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

          {active === "contracts" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> نماذج العقود الرسمية للمنصة
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                قم برفع وتحديث نماذج العقود والاتفاقيات الرسمية للمنصة بصيغة PDF. سيتمكن الأخصائيون من تحميل هذه النماذج وتوقيعها وإعادة رفعها للمراجعة.
              </p>

              <div className="space-y-6">
                {[
                  {
                    id: "trial",
                    title: "عقد فترة التجربة (١٤ يوم)",
                    desc: "النموذج الرسمي لعقد فترة التجربة التجريبية للأخصائيين بعد التسجيل.",
                    fileUrl: initialSettings.trialContractUrl || "/docs/trial_contract_template.pdf",
                  },
                  {
                    id: "marketing",
                    title: "إقرار الحملة الدعائية",
                    desc: "إقرار خاص بالموافقة على الحملات التسويقية ونشر بيانات الأخصائيين.",
                    fileUrl: initialSettings.marketingContractUrl || "/docs/marketing_consent_template.pdf",
                  },
                  {
                    id: "annual",
                    title: "العقد السنوي الشامل",
                    desc: "النموذج الرسمي لعقد العمل السنوي الشامل طويل الأجل.",
                    fileUrl: initialSettings.annualContractUrl || "/docs/annual_contract_template.pdf",
                  },
                ].map((tpl) => {
                  return (
                    <div key={tpl.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/30 gap-4" dir="rtl">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                          {tpl.title}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xl">{tpl.desc}</p>
                        <div className="pt-2 flex items-center gap-3">
                          {tpl.fileUrl && !tpl.fileUrl.startsWith("/docs/") ? (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(tpl.fileUrl);
                                  if (!res.ok) {
                                    alert("العقد غير موجود. يرجى رفعه أولاً.");
                                    return;
                                  }
                                  const blob = await res.blob();
                                  const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
                                  window.open(url, "_blank");
                                } catch {
                                  alert("فشل تحميل العقد");
                                }
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> عرض النموذج الحالي
                            </button>
                          ) : (
                            <span className="text-xs text-amber-600 font-bold">⚠️ لم يتم رفع نموذج بعد</span>
                          )}
                        </div>
                      </div>
                      
                      {!isReadOnly ? (
                        <div className="shrink-0 flex items-center">
                          <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition hover:-translate-y-0.5">
                            <UploadCloud className="w-4 h-4 text-indigo-500" />
                            <span>تحديث النموذج</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 15 * 1024 * 1024) {
                                  alert("حجم الملف يجب ألا يتجاوز 15 ميجابايت");
                                  return;
                                }
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("templateType", tpl.id);

                                try {
                                  const res = await fetch("/api/admin/contracts/upload-template", {
                                    method: "POST",
                                    body: formData,
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    alert("تم تحديث نموذج العقد بنجاح!");
                                    window.location.reload();
                                  } else {
                                    alert(data.error || "فشل رفع النموذج");
                                  }
                                } catch {
                                  alert("حدث خطأ أثناء الاتصال بالخادم لرفع الملف");
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">عرض فقط</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {active === "webcontent" && (
            <>
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> محتوى صفحات الموقع الإلكتروني
              </h2>

              {/* Sub tabs list */}
              <div className="flex gap-2 border-b border-slate-100 pb-3 flex-wrap">
                {[
                  { id: "home", label: "الرئيسية" },
                  { id: "about", label: "من نحن" },
                  { id: "contact", label: "بيانات الاتصال" },
                  { id: "therapists", label: "الحجز والأخصائيين" },
                  { id: "howitworks", label: "كيف نعمل" },
                  { id: "faq", label: "الأسئلة الشائعة" },
                  { id: "terms", label: "الشروط والأحكام" },
                  { id: "privacy", label: "سياسة الخصوصية" }
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubActiveTab(sub.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      subActiveTab === sub.id
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
                        : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
              
              <div className="space-y-6 pt-3">
                {/* Home Page Section */}
                {subActiveTab === "home" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">الصفحة الرئيسية (الواجهة)</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شارة البانر التعريفي الصغير</label>
                        <input type="text" value={homeHeroBadge} onChange={e => !isReadOnly && setHomeHeroBadge(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الرئيسي للبانر (H1)</label>
                        <input type="text" value={homeHeroTitle} onChange={e => !isReadOnly && setHomeHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي للبانر</label>
                        <textarea value={homeHeroSubtitle} onChange={e => !isReadOnly && setHomeHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={3} className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* About Page Section */}
                {subActiveTab === "about" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة من نحن</h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الصفحة الرئيسي</label>
                          <input type="text" value={aboutTitle} onChange={e => !isReadOnly && setAboutTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي</label>
                          <input type="text" value={aboutSubtitle} onChange={e => !isReadOnly && setAboutSubtitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">محتوى صفحة من نحن</label>
                        <textarea value={aboutContent} onChange={e => !isReadOnly && setAboutContent(e.target.value)} disabled={isReadOnly} rows={4} className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Page Section */}
                {subActiveTab === "contact" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">بيانات التواصل بالموقع</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للاتصال</label>
                        <input type="text" value={contactPhone} onChange={e => !isReadOnly && setContactPhone(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للتواصل</label>
                        <input type="text" value={contactEmail} onChange={e => !isReadOnly && setContactEmail(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المقر / الدولة</label>
                        <input type="text" value={contactAddress} onChange={e => !isReadOnly && setContactAddress(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Therapists Page Section */}
                {subActiveTab === "therapists" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة الحجز والأخصائيين</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شارة البانر التعريفي</label>
                        <input type="text" value={therapistsHeroBadge} onChange={e => !isReadOnly && setTherapistsHeroBadge(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر (الجزء العادي)</label>
                          <input type="text" value={therapistsHeroTitle} onChange={e => !isReadOnly && setTherapistsHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر (الجزء الملون البارز)</label>
                          <input type="text" value={therapistsHeroTitleGradient} onChange={e => !isReadOnly && setTherapistsHeroTitleGradient(e.target.value)} disabled={isReadOnly} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">الوصف الفرعي</label>
                        <textarea value={therapistsHeroSubtitle} onChange={e => !isReadOnly && setTherapistsHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={3} className={`${inputCls} resize-none`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الفلترة (تصفية حسب التخصص)</label>
                        <input type="text" value={therapistsFilterTitle} onChange={e => !isReadOnly && setTherapistsFilterTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}

                {/* How it Works Page Section */}
                {subActiveTab === "howitworks" && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة كيف نعمل</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شارة البانر</label>
                        <input type="text" value={howItWorksHeroBadge} onChange={e => !isReadOnly && setHowItWorksHeroBadge(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر الرئيسي</label>
                        <input type="text" value={howItWorksHeroTitle} onChange={e => !isReadOnly && setHowItWorksHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي للبانر</label>
                        <textarea value={howItWorksHeroSubtitle} onChange={e => !isReadOnly && setHowItWorksHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={3} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <h4 className="font-bold text-slate-800 text-sm">خطوات التعافي (6 خطوات)</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {howItWorksSteps.map((step: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl space-y-2.5 bg-slate-50/50">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center">
                                {step.number || (idx + 1)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">الخطوة {idx + 1}</span>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">العنوان</label>
                              <input
                                type="text"
                                value={step.title || ""}
                                onChange={e => {
                                  const updated = [...howItWorksSteps];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setHowItWorksSteps(updated);
                                }}
                                disabled={isReadOnly}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">الوصف</label>
                              <textarea
                                value={step.description || ""}
                                onChange={e => {
                                  const updated = [...howItWorksSteps];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setHowItWorksSteps(updated);
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <h4 className="font-bold text-slate-800 text-sm">مميزات التجربة (4 مميزات)</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {howItWorksFeatures.map((feat: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl space-y-2.5 bg-slate-50/50">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">العنوان</label>
                              <input
                                type="text"
                                value={feat.title || ""}
                                onChange={e => {
                                  const updated = [...howItWorksFeatures];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setHowItWorksFeatures(updated);
                                }}
                                disabled={isReadOnly}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">الوصف</label>
                              <textarea
                                value={feat.description || ""}
                                onChange={e => {
                                  const updated = [...howItWorksFeatures];
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                  setHowItWorksFeatures(updated);
                                }}
                                disabled={isReadOnly}
                                rows={2}
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">الأيقونة (Emoji)</label>
                              <input
                                type="text"
                                value={feat.icon || ""}
                                onChange={e => {
                                  const updated = [...howItWorksFeatures];
                                  updated[idx] = { ...updated[idx], icon: e.target.value };
                                  setHowItWorksFeatures(updated);
                                }}
                                disabled={isReadOnly}
                                className="w-20 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-center bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ Page Section */}
                {subActiveTab === "faq" && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة الأسئلة الشائعة</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شارة البانر</label>
                        <input type="text" value={faqHeroBadge} onChange={e => !isReadOnly && setFaqHeroBadge(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر الرئيسي</label>
                        <input type="text" value={faqHeroTitle} onChange={e => !isReadOnly && setFaqHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي للبانر</label>
                        <textarea value={faqHeroSubtitle} onChange={e => !isReadOnly && setFaqHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={3} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm">قائمة الأسئلة الشائعة ({faqItems.length})</h4>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              setFaqItems([...faqItems, { question: "سؤال جديد؟", answer: "الإجابة هنا...", category: "الاختيار" }]);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 transition-colors shadow-sm"
                          >
                            + إضافة سؤال جديد
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {faqItems.map((faq: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFaqItems(faqItems.filter((_, i) => i !== idx));
                                }}
                                className="absolute left-4 top-4 text-xs font-bold text-red-500 hover:text-red-750 transition-colors"
                              >
                                حذف السؤال ×
                              </button>
                            )}
                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">السؤال</label>
                                <input
                                  type="text"
                                  value={faq.question || ""}
                                  onChange={e => {
                                    const updated = [...faqItems];
                                    updated[idx] = { ...updated[idx], question: e.target.value };
                                    setFaqItems(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">التصنيف</label>
                                <select
                                  value={faq.category || "الاختيار"}
                                  onChange={e => {
                                    const updated = [...faqItems];
                                    updated[idx] = { ...updated[idx], category: e.target.value };
                                    setFaqItems(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                >
                                  {["الاختيار", "الأمان", "الخدمات", "الجدولة", "التسعير", "المتابعة"].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">الإجابة</label>
                              <textarea
                                value={faq.answer || ""}
                                onChange={e => {
                                  const updated = [...faqItems];
                                  updated[idx] = { ...updated[idx], answer: e.target.value };
                                  setFaqItems(updated);
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Page Section */}
                {subActiveTab === "terms" && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة الشروط والأحكام</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر الرئيسي</label>
                        <input type="text" value={termsHeroTitle} onChange={e => !isReadOnly && setTermsHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي للبانر</label>
                        <textarea value={termsHeroSubtitle} onChange={e => !isReadOnly && setTermsHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={2} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm">بنود الشروط والأحكام ({termsSections.length})</h4>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              setTermsSections([...termsSections, { title: "بند جديد", body: "تفاصيل البند...", number: String(termsSections.length + 1), iconName: "User" }]);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 transition-colors shadow-sm"
                          >
                            + إضافة بند جديد
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {termsSections.map((sec: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTermsSections(termsSections.filter((_, i) => i !== idx));
                                }}
                                className="absolute left-4 top-4 text-xs font-bold text-red-500 hover:text-red-750 transition-colors"
                              >
                                حذف البند ×
                              </button>
                            )}
                            <div className="grid gap-3 md:grid-cols-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">الرقم التعريفي (بالعربية)</label>
                                <input
                                  type="text"
                                  value={sec.number || ""}
                                  onChange={e => {
                                    const updated = [...termsSections];
                                    updated[idx] = { ...updated[idx], number: e.target.value };
                                    setTermsSections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">العنوان</label>
                                <input
                                  type="text"
                                  value={sec.title || ""}
                                  onChange={e => {
                                    const updated = [...termsSections];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setTermsSections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">الأيقونة (Lucide Icon)</label>
                                <select
                                  value={sec.iconName || "User"}
                                  onChange={e => {
                                    const updated = [...termsSections];
                                    updated[idx] = { ...updated[idx], iconName: e.target.value };
                                    setTermsSections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                >
                                  {["User", "Shield", "FileText", "CreditCard", "Database", "Bell", "Gavel", "Scale"].map(ico => (
                                    <option key={ico} value={ico}>{ico}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">محتوى البند</label>
                              <textarea
                                value={sec.body || ""}
                                onChange={e => {
                                  const updated = [...termsSections];
                                  updated[idx] = { ...updated[idx], body: e.target.value };
                                  setTermsSections(updated);
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Page Section */}
                {subActiveTab === "privacy" && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-sm font-bold text-indigo-600 border-r-4 border-indigo-500 pr-2">صفحة سياسة الخصوصية</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البانر الرئيسي</label>
                        <input type="text" value={privacyHeroTitle} onChange={e => !isReadOnly && setPrivacyHeroTitle(e.target.value)} disabled={isReadOnly} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي للبانر</label>
                        <textarea value={privacyHeroSubtitle} onChange={e => !isReadOnly && setPrivacyHeroSubtitle(e.target.value)} disabled={isReadOnly} rows={2} className={`${inputCls} resize-none`} />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 text-sm">بنود سياسة الخصوصية ({privacySections.length})</h4>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              setPrivacySections([...privacySections, { title: "بند جديد", body: "تفاصيل السياسة...", number: String(privacySections.length + 1), iconName: "Database" }]);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 transition-colors shadow-sm"
                          >
                            + إضافة بند جديد
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {privacySections.map((sec: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPrivacySections(privacySections.filter((_, i) => i !== idx));
                                }}
                                className="absolute left-4 top-4 text-xs font-bold text-red-500 hover:text-red-750 transition-colors"
                              >
                                حذف البند ×
                              </button>
                            )}
                            <div className="grid gap-3 md:grid-cols-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">الرقم التعريفي (بالعربية)</label>
                                <input
                                  type="text"
                                  value={sec.number || ""}
                                  onChange={e => {
                                    const updated = [...privacySections];
                                    updated[idx] = { ...updated[idx], number: e.target.value };
                                    setPrivacySections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">العنوان</label>
                                <input
                                  type="text"
                                  value={sec.title || ""}
                                  onChange={e => {
                                    const updated = [...privacySections];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setPrivacySections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">الأيقونة (Lucide Icon)</label>
                                <select
                                  value={sec.iconName || "Database"}
                                  onChange={e => {
                                    const updated = [...privacySections];
                                    updated[idx] = { ...updated[idx], iconName: e.target.value };
                                    setPrivacySections(updated);
                                  }}
                                  disabled={isReadOnly}
                                  className={inputCls}
                                >
                                  {["Database", "Eye", "Lock", "Share2", "Cookie", "UserCheck", "RefreshCw", "Mail"].map(ico => (
                                    <option key={ico} value={ico}>{ico}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">محتوى السياسة</label>
                              <textarea
                                value={sec.body || ""}
                                onChange={e => {
                                  const updated = [...privacySections];
                                  updated[idx] = { ...updated[idx], body: e.target.value };
                                  setPrivacySections(updated);
                                }}
                                disabled={isReadOnly}
                                rows={3}
                                className={`${inputCls} resize-none`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
