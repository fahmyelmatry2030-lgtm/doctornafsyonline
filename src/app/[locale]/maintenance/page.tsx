import { useTranslations } from "next-intl";

export default function MaintenancePage() {
  const t = useTranslations("Maintenance");
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <span className="text-5xl block animate-bounce">🛠️</span>
        <h1 className="text-2xl font-black text-slate-800">{t("title")}</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          {t("desc")}
        </p>
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          {t("footer")}
        </div>
      </div>
    </div>
  );
}
