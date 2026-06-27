"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Download,
  AlertTriangle
} from "lucide-react";

interface ContractDetail {
  url: string;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string;
}

interface ContractsData {
  trial?: ContractDetail;
  marketing?: ContractDetail;
  annual?: ContractDetail;
}

const CONTRACT_TYPES = [
  {
    id: "trial" as const,
    title: "عقد فترة التجربة (١٤ يوم)",
    description: "عقد تجريبي يبدأ بعد تسجيلك مباشرة لمدة ١٤ يوماً لتجربة خدمات المنصة وتنظيم العمل الأولي.",
    template: "/docs/trial_contract_template.pdf",
    badge: "فترة التجربة"
  },
  {
    id: "marketing" as const,
    title: "إقرار الحملة الدعائية",
    description: "إقرار خاص بالموافقة على الحملات الدعائية والتسويقية المشتركة وتفويض المنصة بالنشر.",
    template: "/docs/marketing_consent_template.pdf",
    badge: "حملة دعائية"
  },
  {
    id: "annual" as const,
    title: "العقد السنوي الشامل",
    description: "العقد السنوي الشامل للأخصائي بعد انتهاء فترة التجربة لتنظيم العمل والنسب والالتزامات المستمرة.",
    template: "/docs/annual_contract_template.pdf",
    badge: "عقد سنوي"
  }
];

export default function ContractManager() {
  const [contracts, setContracts] = useState<ContractsData>({});
  const [enableAnnualContract, setEnableAnnualContract] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = useState<"trial" | "marketing" | "annual">("trial");
  const [templateUrls, setTemplateUrls] = useState({
    trial: "/docs/trial_contract_template.pdf",
    marketing: "/docs/marketing_consent_template.pdf",
    annual: "/docs/annual_contract_template.pdf",
  });

  useEffect(() => {
    fetchContract();
  }, []);

  async function fetchContract() {
    try {
      const res = await fetch("/api/therapist/contract");
      if (res.ok) {
        const data = await res.json();
        setEnableAnnualContract(data.enableAnnualContract ?? false);
        if (data.trialTemplateUrl) {
          setTemplateUrls({
            trial: data.trialTemplateUrl,
            marketing: data.marketingTemplateUrl || "/docs/marketing_consent_template.pdf",
            annual: data.annualTemplateUrl || "/docs/annual_contract_template.pdf",
          });
        }
        const rawUrl = data.contractUrl;
        if (rawUrl) {
          if (rawUrl.startsWith("{")) {
            try {
              setContracts(JSON.parse(rawUrl));
            } catch {
              // fallback: legacy single contract treated as trial approved
              setContracts({
                trial: { url: rawUrl, status: "APPROVED", uploadedAt: new Date().toISOString() }
              });
            }
          } else {
            // legacy
            setContracts({
              trial: { url: rawUrl, status: "APPROVED", uploadedAt: new Date().toISOString() }
            });
          }
        }
      }
    } catch {
      setError("حدث خطأ أثناء تحميل العقود");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError("حجم الملف يجب ألا يتجاوز 15 ميجابايت");
      return;
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("يرجى اختيار ملف PDF أو صورة صالحة للتحميل (PDF, JPG, PNG)");
      return;
    }

    setUploadingType(activeType);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contractType", activeType);

      const res = await fetch("/api/therapist/contract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const rawUrl = data.contractUrl;
        if (rawUrl) {
          if (rawUrl.startsWith("{")) {
            setContracts(JSON.parse(rawUrl));
          } else {
            setContracts({
              trial: { url: rawUrl, status: "APPROVED", uploadedAt: new Date().toISOString() }
            });
          }
        }
        setSuccessMsg(`تم رفع ${CONTRACT_TYPES.find(c => c.id === activeType)?.title} بنجاح وجاري مراجعته من قبل الإدارة.`);
      } else {
        setError(data.error || "فشل رفع الملف");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم لرفع الملف");
    } finally {
      setUploadingType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileSelect = (type: "trial" | "marketing" | "annual") => {
    setActiveType(type);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> معتمد ومقبول
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> مرفوض (أعد الرفع)
          </span>
        );
      case "PENDING":
        return (
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> قيد المراجعة
          </span>
        );
      default:
        return (
          <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> غير مرفوع
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 border-t border-slate-150 pt-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png,image/jpg"
        className="hidden"
      />

      <div className="bg-gradient-to-l from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">إدارة عقود ومستندات الأخصائي</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          لتفعيل حسابك بالكامل وفتح باب الحجوزات للمرضى، يرجى تحميل النماذج الرسمية أدناه وتوقيعها وإعادة رفعها للمراجعة.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {CONTRACT_TYPES.filter(c => c.id !== "annual" || enableAnnualContract).map((contract) => {
            const data = contracts[contract.id];
            const isUploading = uploadingType === contract.id;

            return (
              <div key={contract.id} className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-250 transition-all gap-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                      {contract.badge}
                    </span>
                    {getStatusBadge(data?.status || "NOT_UPLOADED")}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{contract.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{contract.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a 
                    href={templateUrls[contract.id]}
                    target="_blank"
                    download
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" /> تحميل النموذج الرسمي
                  </a>

                  {data?.url ? (
                    <div className="flex gap-2">
                      <a 
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl py-2.5 hover:bg-indigo-100 transition-colors text-center"
                      >
                        <FileText className="w-3.5 h-3.5" /> تحميل الملف
                      </a>
                      <button 
                        type="button"
                        onClick={() => triggerFileSelect(contract.id)}
                        disabled={!!uploadingType}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                        تحديث الملف
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => triggerFileSelect(contract.id)}
                      disabled={!!uploadingType}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-indigo-600 rounded-xl py-2.5 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          رفع المستند الموقع
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
