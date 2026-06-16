"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Pencil, Trash2, Star, X, ChevronRight, ChevronLeft, MessageSquare } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  readTime: string;
  icon: string;
  createdAt: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patient: { name: string };
  therapist: { name: string };
};

const ICONS = ["📝", "🧠", "💊", "❤️", "🌿", "🔬", "🧘", "👶", "👴", "💪", "🌙", "☀️"];
const CATEGORIES = ["عام", "صحة نفسية", "علاج معرفي", "أسرة وعلاقات", "طفولة", "قلق واكتئاب", "تطوير ذات"];

export default function ContentPage() {
  const [tab, setTab] = useState<"articles" | "reviews">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", author: "", category: "عام", readTime: "5 دقائق", icon: "📝" });
  const [saving, setSaving] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [artRes, revRes] = await Promise.all([
      fetch("/api/admin/articles"),
      fetch("/api/admin/reviews"),
    ]);
    if (artRes.ok) setArticles(await artRes.json());
    if (revRes.ok) setReviews(await revRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ title: "", slug: "", content: "", author: "", category: "عام", readTime: "5 دقائق", icon: "📝" }); setEditingId(null); setShowForm(true); };
  const openEdit = (a: Article) => { setForm({ title: a.title, slug: a.slug, content: a.content, author: a.author, category: a.category, readTime: a.readTime, icon: a.icon }); setEditingId(a.id); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, id: editingId } : form;
    await fetch("/api/admin/articles", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    await fetch("/api/admin/articles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const filteredReviews = ratingFilter > 0 ? reviews.filter(r => r.rating === ratingFilter) : reviews;
  const PAGE_SIZE = 8;
  const paginatedReviews = filteredReviews.slice((reviewPage - 1) * PAGE_SIZE, reviewPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">المقالات والتقييمات</h1>
          <p className="text-slate-500 mt-1">إدارة محتوى المدونة وتقييمات المستخدمين</p>
        </div>
        {tab === "articles" && (
          <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-900/20">
            <Plus className="w-4 h-4" /> مقال جديد
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ id: "articles", label: "المقالات", icon: <BookOpen className="w-4 h-4" /> }, { id: "reviews", label: "التقييمات", icon: <Star className="w-4 h-4" /> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as "articles" | "reviews")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "articles" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">لا توجد مقالات بعد. ابدأ بإضافة أول مقال!</p>
            </div>
          ) : articles.map(a => (
            <div key={a.id} className="glass rounded-2xl border border-[var(--color-border-soft)] p-5 flex flex-col gap-3 hover:shadow-premium transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{a.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{a.author} · {a.readTime}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">{a.category}</span>
                <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString("ar-EG")}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{a.content}</p>
              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                <button onClick={() => openEdit(a)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 py-1.5 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> تعديل
                </button>
                <button onClick={() => deleteArticle(a.id)} className="flex-1 flex items-center justify-center gap-1.5 text-sm text-red-500 font-semibold hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rating Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-600">تصفية حسب النجوم:</span>
            {[0, 5, 4, 3, 2, 1].map(r => (
              <button key={r} onClick={() => { setRatingFilter(r); setReviewPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${ratingFilter === r ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {r === 0 ? "الكل" : `${"⭐".repeat(r)} ${r}`}
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl border border-[var(--color-border-soft)] overflow-hidden">
            <div className="divide-y divide-slate-50">
              {paginatedReviews.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">لا توجد تقييمات.</p>
                </div>
              ) : paginatedReviews.map(r => (
                <div key={r.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">{r.patient.name} → د. {r.therapist.name}</p>
                      <div className="flex items-center gap-1 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                        ))}
                        <span className="text-xs text-slate-500 mr-1">{r.rating}/5</span>
                      </div>
                      {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                    </div>
                    <p className="text-xs text-slate-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => setReviewPage(p => Math.max(1, p - 1))} disabled={reviewPage === 1}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
                <span className="text-sm text-slate-500">صفحة {reviewPage} من {totalPages}</span>
                <button onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))} disabled={reviewPage === totalPages}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed">
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-black text-slate-900 text-lg">{editingId ? "تعديل المقال" : "إضافة مقال جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الأيقونة</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`text-xl p-2 rounded-lg transition-all ${form.icon === ic ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-slate-100"}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">عنوان المقال</label>
                  <input value={form.title} onChange={e => {
                    const titleVal = e.target.value;
                    // Replace spaces and special characters, keeping Arabic letters, English letters, and numbers
                    const generatedSlug = titleVal
                      .toLowerCase()
                      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s-]/g, "") // Keep Arabic characters, English alphanumeric, spaces, and dashes
                      .trim()
                      .replace(/\s+/g, "-"); // Replace all spaces with a single dash
                    setForm(f => ({ ...f, title: titleVal, slug: generatedSlug }));
                  }}
                    required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="مثال: كيف تتعامل مع القلق؟" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">المؤلف</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="د. أحمد محمد" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">وقت القراءة</label>
                  <input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                    required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="5 دقائق" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">التصنيف</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">محتوى المقال</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    required rows={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    placeholder="اكتب محتوى المقال هنا..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                  {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "نشر المقال"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
