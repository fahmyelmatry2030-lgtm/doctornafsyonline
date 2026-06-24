"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PrintReportButton() {
  const t = useTranslations("AdminReports");

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-600/20 print:hidden"
    >
      <Printer className="w-4 h-4" />
      {t ? t("printReport") : "طباعة التقرير"}
    </button>
  );
}
