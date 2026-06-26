import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
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
        <h1 className="mb-4 text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
            <User className="h-4 w-4" />
            {post.author || "إدارة نَفسي"}
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-4 w-4" />
            {format(new Date(post.createdAt), "dd MMMM yyyy", { locale: arSA })}
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-4 w-4" />
            {post.readTime}
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}
