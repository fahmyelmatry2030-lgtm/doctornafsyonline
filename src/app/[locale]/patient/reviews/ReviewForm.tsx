"use client";

import { useState } from "react";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";

interface ReviewFormProps {
  appointmentId: string;
  therapistName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({
  appointmentId,
  therapistName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("يرجى اختيار تقييم");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        return;
      }

      setIsSubmitted(true);
      onSuccess?.();
    } catch {
      setError("فشل الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-lg font-bold text-slate-800">شكراً لتقييمك! 💚</p>
        <p className="text-sm text-slate-500 mt-1">
          تقييمك يساعد الآخرين في اختيار الأخصائي المناسب
        </p>
      </div>
    );
  }

  const ratingLabels = ["", "سيء", "مقبول", "جيد", "جيد جداً", "ممتاز"];

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        كيف كانت تجربتك مع <span className="font-bold text-slate-800">د. {therapistName}</span>؟
      </p>

      {/* Star Rating */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none"
              aria-label={`${star} نجوم`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredStar || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
        {(hoveredStar || rating) > 0 && (
          <span className="text-sm font-semibold text-amber-600 animate-fade-in">
            {ratingLabels[hoveredStar || rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب تعليقك هنا... (اختياري)"
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
      />

      {error && (
        <p className="text-sm text-red-500 font-semibold animate-fade-in">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-indigo-600 to-indigo-500 text-white font-bold text-sm hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </div>
  );
}
