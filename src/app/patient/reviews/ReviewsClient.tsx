"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Clock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import ReviewForm from "./ReviewForm";

interface ReviewableAppointment {
  id: string;
  scheduledAt: string;
  therapist: { name: string; avatar: string | null };
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  appointment: {
    scheduledAt: string;
    therapist: { name: string; avatar: string | null };
  };
}

export default function ReviewsClient({
  reviewableAppointments: initialReviewable,
  existingReviews: initialReviews,
}: {
  reviewableAppointments: ReviewableAppointment[];
  existingReviews: ExistingReview[];
}) {
  const [reviewable, setReviewable] = useState(initialReviewable);
  const [reviews] = useState(initialReviews);
  const [openForm, setOpenForm] = useState<string | null>(null);

  const handleReviewSuccess = (appointmentId: string) => {
    setTimeout(() => {
      setReviewable((prev) => prev.filter((a) => a.id !== appointmentId));
      setOpenForm(null);
    }, 2000);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">التقييمات</h1>
        <p className="text-slate-600 mt-2 text-lg">
          شارك تجربتك مع الأخصائيين وساعد الآخرين في اتخاذ قرارهم 💬
        </p>
      </div>

      {/* Reviewable Appointments */}
      {reviewable.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            جلسات بانتظار تقييمك
          </h2>
          <div className="space-y-3">
            {reviewable.map((app) => (
              <div
                key={app.id}
                className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] overflow-hidden transition-all"
              >
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/60 transition-colors"
                  onClick={() =>
                    setOpenForm(openForm === app.id ? null : app.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {app.therapist.avatar ? (
                        <img
                          src={encodeURI(decodeURI())}
                          alt={app.therapist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EEF2FF] text-[#6366F1] font-bold text-lg">
                          {app.therapist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        د. {app.therapist.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(app.scheduledAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                      قيّم الآن
                    </span>
                    {openForm === app.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                {openForm === app.id && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-fade-in">
                    <ReviewForm
                      appointmentId={app.id}
                      therapistName={app.therapist.name}
                      onSuccess={() => handleReviewSuccess(app.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          تقييماتك السابقة
          <span className="text-sm font-normal text-slate-400">
            ({reviews.length})
          </span>
        </h2>

        {reviews.length === 0 && reviewable.length === 0 ? (
          <div className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Star className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">
              لا توجد تقييمات بعد
            </p>
            <p className="text-sm text-slate-400 mt-1">
              بعد إتمام جلستك الأولى، يمكنك مشاركة تجربتك هنا
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="card-glow glass rounded-2xl border border-[var(--color-border-soft)] p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {review.appointment.therapist.avatar ? (
                        <img
                          src={encodeURI(decodeURI())}
                          alt={review.appointment.therapist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EEF2FF] text-[#6366F1] font-bold">
                          {review.appointment.therapist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        د. {review.appointment.therapist.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
