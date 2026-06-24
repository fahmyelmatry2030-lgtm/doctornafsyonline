"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, ShieldAlert, Award, Calendar, User, 
  BookOpen, Clock, Loader2, ArrowRight, CheckCircle2, AlertTriangle, Search
} from "lucide-react";
import Link from "next/link";

interface Certificate {
  code: string;
  traineeName: string;
  courseName: string;
  issueDate: string;
  grade?: string;
  hours?: number;
  instructor?: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
}

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [code, setCode] = useState(codeParam || "");
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (codeParam) {
      verifyCode(codeParam);
    }
  }, [codeParam]);

  async function verifyCode(verificationCode: string) {
    if (!verificationCode.trim()) return;

    setLoading(true);
    setError("");
    setCert(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/certificates/verify?code=${encodeURIComponent(verificationCode.trim())}`);
      const data = await res.json();
      
      if (res.ok) {
        setCert(data.certificate);
      } else {
        setError(data.error || "الشهادة غير مسجلة أو كود التحقق غير صالح.");
      }
    } catch {
      setError("فشل الاتصال بالخادم للتحقق من الشهادة.");
    } finally {
      setLoading(false);
    }
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      verifyCode(code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-xl w-full mx-auto space-y-8 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-2xl">
            <Award className="w-8 h-8" />
            <span>نَفْسي</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">نظام توثيق واعتماد الشهادات الرسمي</h2>
          <p className="text-xs text-slate-500">تحقق من صحة وصلاحية شهادات الكورسات والتدريب الصادرة عن المنصة</p>
        </div>

        {/* Manual Lookup Form if no code param or if searched/not found */}
        {(!codeParam || error || !cert) && (
          <form onSubmit={handleManualSearch} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <div className="space-y-2">
              <label htmlFor="searchCode" className="block text-xs font-bold text-slate-700">
                إدخال كود تحقق الشهادة
              </label>
              <div className="relative">
                <input
                  id="searchCode"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="مثال: NAFSI-CERT-1052"
                  className="w-full rounded-xl border border-slate-200 pr-4 pl-10 py-3 text-slate-700 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ltr text-right font-mono"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="absolute left-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Result States */}
        {loading && (
          <div className="bg-white p-12 rounded-3xl border border-slate-150 shadow-md text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">جاري الاستعلام في السجلات المعتمدة للمنصة...</p>
          </div>
        )}

        {/* NOT FOUND / ERROR STATE */}
        {!loading && searched && error && (
          <div className="bg-white rounded-3xl border border-red-200 shadow-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-red-500 to-red-650 p-6 text-center text-white space-y-2">
              <ShieldAlert className="w-16 h-16 mx-auto stroke-1" />
              <h3 className="text-lg font-black">الشهادة غير معتمدة أو ملغاة!</h3>
            </div>
            <div className="p-6 text-center space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                رمز التحقق المدخل (<span className="font-mono font-bold text-red-650">{code}</span>) لم يتم العثور عليه في قاعدة بيانات المتدربين الحاصلين على شهادات معتمدة من منصة نفسي.
              </p>
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start gap-2.5 text-right text-xs text-red-700 leading-relaxed">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>
                  <strong>تنبيه هام:</strong> نرجو الحذر من استخدام شهادات غير رسمية أو غير موثقة باسم المنصة. للتأكد، يرجى إعادة إدخال الرمز بشكل صحيح مع مراعاة الحروف الكبيرة والشرطات.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VERIFIED SUCCESS STATE */}
        {!loading && cert && (
          <div className="bg-white rounded-3xl border border-emerald-250 shadow-xl overflow-hidden animate-fade-in relative">
            
            {/* Elegant Top Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white space-y-2 relative">
              {/* Decorative Stamp Background */}
              <div className="absolute top-2 left-4 w-20 h-20 border border-white/10 rounded-full flex items-center justify-center rotate-12 select-none pointer-events-none">
                <span className="text-[7px] text-white/20 font-black tracking-widest text-center leading-none">NAFSI<br/>OFFICIAL<br/>SEAL</span>
              </div>

              <ShieldCheck className="w-16 h-16 mx-auto stroke-1 text-emerald-100 drop-shadow-sm" />
              <h3 className="text-xl font-black">شهادة موثقة ومعتمدة رسمياً</h3>
              <p className="text-[10px] text-emerald-100/90 font-bold uppercase tracking-widest font-mono">
                Verification Code: {cert.code}
              </p>
            </div>

            {/* Certificate Visual Content */}
            <div className="p-8 space-y-8 relative">
              {/* Watermark Logo Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                <Award className="w-64 h-64" />
              </div>

              {/* Verified Badge and Message */}
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-400 font-bold">تشهد منصة نفسي للتمكين النفسي والتدريب بأن:</p>
                <h4 className="text-2xl font-black text-slate-900 border-b-2 border-indigo-50 pb-2 inline-block px-4">
                  {cert.traineeName}
                </h4>
                <p className="text-xs text-slate-650 leading-relaxed mt-2">
                  قد أكمل بنجاح متطلبات الدورة التدريبية المعتمدة بعنوان:
                </p>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mt-1.5">
                  <span className="font-extrabold text-slate-800 text-sm block leading-snug">
                    {cert.courseName}
                  </span>
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-6">
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">تاريخ الإصدار</span>
                    <span className="font-black text-slate-800">
                      {new Date(cert.issueDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">عدد الساعات التدريبية</span>
                    <span className="font-black text-slate-800">
                      {cert.hours ? `${cert.hours} ساعة تدريبية` : "معتمدة"}
                    </span>
                  </div>
                </div>

                {cert.instructor && (
                  <div className="flex gap-2">
                    <User className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">المحاضر / المشرف</span>
                      <span className="font-black text-slate-800">{cert.instructor}</span>
                    </div>
                  </div>
                )}

                {cert.grade && (
                  <div className="flex gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">التقدير العام</span>
                      <span className="font-black text-slate-800">{cert.grade}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Stamp (ختم نفسي المعتمد الفخم) */}
              <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ختم الاعتماد الرسمي سارٍ وصالح</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-xs font-bold transition-colors"
          >
            العودة للرئيسية <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
      </div>
    }>
      <VerifyCertificateContent />
    </Suspense>
  );
}
