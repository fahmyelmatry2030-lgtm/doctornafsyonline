import { notFound } from "next/navigation";

const posts: Record<string, { title: string; content: string }> = {
  "choose-therapist": {
    title: "كيف تختار الأخصائي النفسي المناسب؟",
    content:
      "اختر أخصائي يعتمد على تخصصه، خبرته، وتقييمات المرضى السابقين. تأكد من أن أسلوبه يعجبك وأنه يقدم الجلسة التي تحتاجها.",
  },
  "online-therapy-benefits": {
    title: "فوائد جلسات الدعم النفسي عبر الإنترنت",
    content:
      "الجلسات عبر الإنترنت توفر مرونة وخصوصية، وتتيح لك التواصل مع أخصائيين من أي مكان دون الحاجة للتنقل.",
  },
  "first-session-guide": {
    title: "التحضير للجلسة الأولى مع الأخصائي",
    content:
      "جهز نقاط الحديث الرئيسية، الأعراض التي تشعر بها، وأهدافك من العلاج. هذا يساعد الأخصائي على فهم حالتك بسرعة.",
  },
};

type Props = {
  params: { slug: string };
};

export default function BlogArticlePage({ params }: Props) {
  const post = posts[params.slug];
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">{post.title}</h1>
        <p className="text-lg leading-relaxed text-slate-600">{post.content}</p>
      </div>
    </div>
  );
}
