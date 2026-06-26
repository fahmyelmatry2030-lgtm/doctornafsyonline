"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare } from "lucide-react";

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback if beforeinstallprompt is not available (like iOS Safari)
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
      >
        <Download className="h-4 w-4 animate-bounce" />
        <span>حمل التطبيق</span>
      </button>

      {/* Fallback Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInstructions(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 text-center space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-800">تثبيت التطبيق يدوياً</h3>
            
            <div className="space-y-4 text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col space-y-2">
                <p className="font-bold text-slate-700 text-sm">🍎 لأجهزة آيفون (Safari):</p>
                <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                  <li>اضغط على زر المشاركة <Share className="inline w-4 h-4 text-slate-400" /> أسفل الشاشة</li>
                  <li>اختر "إضافة للشاشة الرئيسية" أو "Add to Home Screen" <PlusSquare className="inline w-4 h-4 text-slate-400" /></li>
                </ol>
              </div>
              <div className="w-full h-px bg-slate-200"></div>
              <div className="flex flex-col space-y-2">
                <p className="font-bold text-slate-700 text-sm">🤖 لأجهزة أندرويد (Chrome):</p>
                <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                  <li>اضغط على الثلاث نقاط العلوية بالشريط أعلى المتصفح</li>
                  <li>اختر "تثبيت التطبيق" أو "Install App"</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
