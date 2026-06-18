import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, TrendingUp } from "lucide-react";

const posts = [
  {
    title: "كيف تختار الأخصائي النفسي المناسب؟",
    description:
      "دليل عملي شامل يساعدك على اختيار الأخصائي الذي يناسب مشكلتك وشخصيتك العلاجية وأسلوبك المفضل.",
    href: "/blog/choose-therapist",
    category: "نصائح عملية",
    readTime: "5 دقائق",
    icon: "🎯",
  },
  {
    title: "فوائد جلسات الدعم النفسي عبر الإنترنت",
    description:
      "اكتشف لماذا العيادات النفسية الأونلاين أصبحت الخيار الأول للكثيرين وكيف تحقق نتائج مماثلة أو أفضل.",
    href: "/blog/online-therapy-benefits",
    category: "معلومات صحية",
    readTime: "7 دقائق",
    icon: "💻",
  },
  {
    title: "التحضير للجلسة الأولى مع الأخصائي",
    description:
      "كيف تجهز نفسك وبيئتك لتجربة علاجية أكثر سلاسة وفعالية من أول جلسة للحصول على أقصى استفادة.",
    href: "/blog/first-session-guide",
    category: "دليل المبتدئين",
    readTime: "6 دقائق",
    icon: "🚀",
  },
];

const categories = [
  { name: "نصائح عملية", color: "from-blue-500 to-blue-600" },
  { name: "معلومات صحية", color: "from-emerald-500 to-emerald-600" },
  { name: "دليل المبتدئين", color: "from-purple-500 to-purple-600" },
];

export default function BlogPage() {
  return (
    <div>
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 py-24 md:py-32">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4" />
              مقالات تهمك
            </span>
            <h1 className="mb-6 text-5xl font-black text-white md:text-6xl">
              مقالات عن <span className="text-yellow-200">الصحة النفسية</span>
            </h1>
            <p className="text-xl text-white/90">
              نصائح عملية ومعلومات صحية تساعدك على فهم صحتك النفسية بشكل أعمق
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Articles Grid */}
        <section className="mb-20">
          <div className="mb-12">
            <h2 className="mb-3 text-4xl font-black text-slate-900">أحدث المقالات</h2>
            <p className="max-w-2xl text-lg text-slate-600">
              اختر مقالة تهمك واقرأ نصائح عملية وموثوقة من متخصصين
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group relative rounded-3xl border-2 border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2"
              >
                {/* Top Bar with Icon */}
                <div className="h-16 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-4xl">
                  {post.icon}
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-4 text-2xl font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-slate-600 group-hover:text-slate-700 transition leading-relaxed">
                    {post.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.readTime}
                    </div>
                    <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                      اقرأ الآن
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Content Strategy Section */}
        <section className="mb-20 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-12 border-2 border-slate-200">
          <div className="max-w-3xl">
            <TrendingUp className="mb-4 h-12 w-12 text-teal-600" />
            <h2 className="mb-4 text-3xl font-black text-slate-900">استراتيجيتنا في المحتوى</h2>
            <p className="mb-6 text-lg text-slate-600 leading-relaxed">
              نركز على تقديم محتوى نفسي موثوق وعملي يساعدك على:
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "فهم أعراضك",
                  desc: "معرفة العلامات والأعراض والتمييز بينها",
                },
                {
                  title: "اختيار الأخصائي",
                  desc: "معايير واضحة لاختيار من يناسبك",
                },
                {
                  title: "تحسين التجربة",
                  desc: "نصائح للاستفادة القصوى من الجلسات",
                },
                {
                  title: "الرعاية الذاتية",
                  desc: "تقنيات للعناية بنفسك بين الجلسات",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white p-6 border-2 border-slate-200 hover:border-teal-300 transition">
                  <h3 className="mb-2 font-bold text-slate-900 text-lg">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-600 tracking-widest">📚 أقسام المقالات</p>
            <h2 className="mb-4 text-4xl font-black text-slate-900">تصفح حسب الفئة</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-3xl bg-gradient-to-br ${cat.color} p-8 text-white text-center hover:shadow-xl transition cursor-pointer group`}
              >
                <div className="mb-3 text-5xl">📖</div>
                <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                <p className="opacity-90 mb-4">مجموعة متنوعة من المقالات المفيدة</p>
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition text-white font-semibold">
                  تصفح الآن ←
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter / More Content */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-700 to-emerald-700 p-12 text-white">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative">
            <BookOpen className="mb-4 h-12 w-12" />
            <h2 className="mb-3 text-3xl font-black">محتوى جديد بانتظارك</h2>
            <p className="mb-6 text-lg opacity-95">
              نضيف مقالات جديدة بشكل منتظم لمساعدتك في رحلة صحتك النفسية. ابق على تواصل معنا!
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-teal-700 transition hover:shadow-lg"
              >
                اتصل بنا
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition"
              >
                أو تصفح أسئلتك الشائعة ←
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
