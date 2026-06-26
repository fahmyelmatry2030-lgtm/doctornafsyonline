import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const post = await prisma.article.findUnique({
    where: { slug: decodedSlug },
  });

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">{post.title}</h1>
        <div className="prose prose-lg max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}
