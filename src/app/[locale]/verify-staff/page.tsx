"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, Award, Calendar, User as UserIcon, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Translate role keys to reader-friendly titles
function getRoleLabel(role: string, t: any) {
  if (role === "ADMIN") return t("roleAdmin");
  if (role === "ADMIN_HR") return t("roleHR");
  if (role === "ADMIN_ACCOUNTING") return t("roleAccounting");
  if (role === "ADMIN_VIEWER") return t("roleViewer");
  if (role === "SHIFT_LEADER") return t("roleShiftLeader");
  if (role === "ADMIN_CUSTOMER_SERVICE") return t("roleCS");
  if (role === "THERAPIST") return t("roleTherapist");
  return t("roleDefault");
}

function VerifyStaffContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("code");
  const t = useTranslations("VerifyStaff");

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchEmployee() {
      try {
        const res = await fetch(`/api/public/verify-staff/${userId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Not found");
        }
        const data = await res.json();
        setEmployee(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("systemError")}</h2>
          <p className="text-gray-500 mb-8">{error}</p>
        </div>
      </div>
    );
  }

  if (!userId || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
        <div className="mb-8 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
            <img src="/logo.png?v=5" alt="Doctor Nafsy Online" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-2">{t("subtitle")}</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("noCodeTitle")}</h2>
          <p className="text-gray-500 mb-8">{t("noCodeDesc")}</p>
        </div>
      </div>
    );
  }

  const isVerified = !employee.isSuspended && 
    (employee.role !== "THERAPIST" || employee.therapistProfile?.isVerified === true);

  let parsedSpecializations = t("roleTherapist");
  if (employee.role === "THERAPIST" && employee.therapistProfile?.specializations) {
    try {
      const parsed = JSON.parse(employee.therapistProfile.specializations);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedSpecializations = parsed.join(", ");
      } else {
        parsedSpecializations = employee.therapistProfile.specializations;
      }
    } catch (e) {
      // If it's not JSON, use it directly but strip brackets just in case
      parsedSpecializations = employee.therapistProfile.specializations.replace(/[\[\]"']/g, "");
    }
  }

  const displayRole = employee.role === "THERAPIST"
    ? parsedSpecializations
    : getRoleLabel(employee.role, t);

  const joinDate = employee.createdAt ? new Date(employee.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : t("notAvailable");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center mt-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
          <img src="/logo.png?v=5" alt="Doctor Nafsy Online" className="h-16 w-auto rounded-lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-2">{t("platformName")}</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Status Banner */}
        {isVerified ? (
          <div className="bg-green-500 text-white p-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-bold text-lg">{t("verified")}</span>
          </div>
        ) : (
          <div className="bg-red-500 text-white p-4 flex items-center justify-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-bold text-lg">{t("suspended")}</span>
          </div>
        )}

        <div className="p-8">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {employee.avatar && !avatarError ? (
                <img 
                  src={encodeURI(decodeURI(employee.avatar))} 
                  alt={employee.name} 
                  className={`w-32 h-32 rounded-full object-cover border-4 ${isVerified ? 'border-green-100' : 'border-red-100'} shadow-lg`}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isVerified ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} shadow-lg border-4 ${isVerified ? 'border-green-100' : 'border-red-100'}`}>
                  <UserIcon className="w-16 h-16" />
                </div>
              )}
              {isVerified && (
                <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
            <p className="text-primary font-medium mt-1 text-lg">{displayRole}</p>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("officialRole")}</p>
                <p className="font-semibold text-gray-900">{getRoleLabel(employee.role, t)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("joinDate")}</p>
                <p className="font-semibold text-gray-900">{joinDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("idNumber")}</p>
                <p className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm tracking-wider">
                  {employee.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-10 bg-gray-50 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t("cardDesc")}
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full gap-2 bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("goHome")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-400">
        © {new Date().getFullYear()} {t("copyright")}
      </p>
    </div>
  );
}

export default function VerifyStaffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <VerifyStaffContent />
    </Suspense>
  );
}
