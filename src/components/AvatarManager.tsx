"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AvatarManager({ initialAvatar, name }: { initialAvatar: string | null; name: string }) {
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("يرجى اختيار صورة صالحة بصيغة JPG أو PNG أو WEBP");
      return;
    }

    setError("");
    setSuccess(false);
    setUploading(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatar(localUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/therapist/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAvatar(data.avatar);
        setSuccess(true);
        router.refresh();
      } else {
        setError(data.error || "فشل رفع الصورة الشخصية");
        setAvatar(initialAvatar);
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
      setAvatar(initialAvatar);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-100">
      <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white ring-4 ring-indigo-50 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg relative">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-indigo-700">{name.charAt(0)}</span>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
            <Camera className="w-6 h-6 text-white" />
          </div>

          {/* Uploading Loader */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Camera icon badge */}
        <button 
          type="button"
          className="absolute bottom-0 left-0 bg-indigo-600 text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-indigo-700 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      <div className="text-center">
        <h3 className="font-bold text-slate-800 text-base">الصورة الشخصية للأخصائي</h3>
        <p className="text-xs text-slate-400 mt-1">تظهر للمرضى في صفحة الحجز وقائمة الأخصائيين</p>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم تحديث الصورة الشخصية بنجاح!</span>
        </div>
      )}
    </div>
  );
}
