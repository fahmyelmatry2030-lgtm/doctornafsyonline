"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import AvatarManager from "@/components/AvatarManager";
import {
  User,
  FileText,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  X,
  GraduationCap,
  Languages,
  DollarSign,
  Briefcase,
  Heart,
} from "lucide-react";

const SPECIALIZATIONS = [
  "القلق والتوتر",
  "الاكتئاب",
  "العلاقات الزوجية",
  "اضطرابات الأكل",
  "الإدمان",
  "اضطراب ما بعد الصدمة",
  "الوسواس القهري",
  "صعوبات التعلم",
  "الأطفال والمراهقين",
  "التطوير الذاتي",
  "إدارة الغضب",
  "الحزن والفقدان",
];

const LANGUAGES = ["العربية", "English", "Français", "Türkçe", "اردو"];

interface CertificateFile {
  name: string;
  size: number;
  file: File;
}

export default function TherapistOnboardingPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Step 1 - Personal Info
  const [bio, setBio] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["العربية"]);
  const [yearsExperience, setYearsExperience] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");

  // Step 2 - Certificates
  const [certificates, setCertificates] = useState<CertificateFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!bio.trim() || bio.length < 50) newErrors.bio = "يرجى كتابة نبذة لا تقل عن 50 حرف";
    if (selectedSpecs.length === 0) newErrors.specs = "يرجى اختيار تخصص واحد على الأقل";
    if (!yearsExperience || parseInt(yearsExperience) < 1) newErrors.years = "يرجى إدخال سنوات الخبرة";
    if (!pricePerSession || parseInt(pricePerSession) < 50) newErrors.price = "يرجى إدخال سعر الجلسة (50 ر.س كحد أدنى)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (certificates.length === 0) newErrors.certs = "يرجى رفع شهادة واحدة على الأقل";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newCerts: CertificateFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.size <= 5 * 1024 * 1024) {
        newCerts.push({ name: file.name, size: file.size, file });
      }
    });
    setCertificates((prev) => [...prev, ...newCerts]);
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const newCerts: CertificateFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.size <= 5 * 1024 * 1024) {
        newCerts.push({ name: file.name, size: file.size, file });
      }
    });
    setCertificates((prev) => [...prev, ...newCerts]);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload each certificate individually using the existing API
      for (const cert of certificates) {
        const formData = new FormData();
        formData.append("name", cert.name);
        formData.append("file", cert.file);

        await fetch("/api/therapist/certificates", {
          method: "POST",
          body: formData,
        });
      }

      // Update therapist profile with bio, specializations, etc.
      const profileRes = await fetch("/api/therapist/certificates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          specializations: selectedSpecs.join("، "),
          languages: selectedLangs.join("، "),
          yearsExperience: parseInt(yearsExperience),
          pricePerSession: parseInt(pricePerSession),
        }),
      });

      if (profileRes.ok) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            تم إرسال طلبك بنجاح! 🎉
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            شكراً لانضمامك إلى فريق نَفسي. سيقوم فريقنا بمراجعة بياناتك
            وشهاداتك وسنتواصل معك قريباً.
          </p>
          <div className="mt-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-sm text-indigo-700 font-semibold">
              ⏰ عادةً ما تتم المراجعة خلال 24-48 ساعة
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "المعلومات الشخصية", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "الشهادات", icon: <GraduationCap className="w-4 h-4" /> },
    { num: 3, label: "التأكيد", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900">
          إعداد حسابك كأخصائي
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          أكمل البيانات التالية لتفعيل حسابك والبدء في استقبال المرضى
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                step === s.num
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : step > s.num
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > s.num ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                s.icon
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  step > s.num ? "bg-green-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card-glow glass rounded-3xl border border-[var(--color-border-soft)] p-8">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              أخبرنا عن نفسك
            </h2>

            {/* Avatar Upload */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
              <AvatarManager initialAvatar={(session?.user as any)?.avatar || null} name={session?.user?.name || "أخصائي"} />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                نبذة تعريفية
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة مختصرة عن خبرتك ومنهجك العلاجي..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
              <div className="flex justify-between mt-1">
                {errors.bio && (
                  <p className="text-xs text-red-500 font-semibold">{errors.bio}</p>
                )}
                <span className="text-xs text-slate-400 mr-auto">
                  {bio.length}/500
                </span>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                التخصصات
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => toggleSpec(spec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedSpecs.includes(spec)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              {errors.specs && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.specs}</p>
              )}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-500" />
                اللغات
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedLangs.includes(lang)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Years of Experience & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  سنوات الخبرة
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="مثال: 5"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                {errors.years && (
                  <p className="text-xs text-red-500 font-semibold mt-1">{errors.years}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  سعر الجلسة (ر.س)
                </label>
                <input
                  type="number"
                  min="50"
                  value={pricePerSession}
                  onChange={(e) => setPricePerSession(e.target.value)}
                  placeholder="مثال: 200"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                {errors.price && (
                  <p className="text-xs text-red-500 font-semibold mt-1">{errors.price}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Certificates */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              الشهادات والاعتمادات
            </h2>
            <p className="text-sm text-slate-500">
              ارفع شهاداتك الأكاديمية وتراخيص مزاولة المهنة (PDF أو صورة، الحد الأقصى 5 ميغا لكل ملف)
            </p>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
            >
              <Upload className="w-10 h-10 mx-auto text-slate-300 group-hover:text-indigo-400 transition-colors" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                اسحب الملفات هنا أو{" "}
                <span className="text-indigo-600 underline">تصفح</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG — الحد الأقصى 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Uploaded Files */}
            {certificates.length > 0 && (
              <div className="space-y-2">
                {certificates.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                          {cert.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(cert.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCertificate(index)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.certs && (
              <p className="text-xs text-red-500 font-semibold">{errors.certs}</p>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              مراجعة وتأكيد
            </h2>
            <p className="text-sm text-slate-500">
              تأكد من صحة بياناتك قبل الإرسال:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-700">النبذة التعريفية</span>
                  <button onClick={() => setStep(1)} className="text-xs text-indigo-600 font-semibold hover:underline">
                    تعديل
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">التخصصات</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSpecs.map((s) => (
                      <span key={s} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">اللغات</span>
                  <p className="text-sm font-semibold text-slate-800 mt-2">
                    {selectedLangs.join("، ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xs font-bold text-slate-500">سنوات الخبرة</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{yearsExperience}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-xs font-bold text-slate-500">سعر الجلسة</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{pricePerSession} <span className="text-sm text-slate-500">ر.س</span></p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-700">الشهادات ({certificates.length})</span>
                  <button onClick={() => setStep(2)} className="text-xs text-indigo-600 font-semibold hover:underline">
                    تعديل
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {certificates.map((cert, i) => (
                    <p key={i} className="text-sm text-slate-600 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      {cert.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-indigo-600 to-indigo-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-green-600 to-emerald-500 text-white text-sm font-bold hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
