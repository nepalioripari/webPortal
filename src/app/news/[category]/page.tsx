import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { notFound } from "next/navigation";

const validCategories = [
  "politics",
  "sports",
  "technology",
  "entertainment",
  "business",
  "general",
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const articles = await prisma.article.findMany({
    where: { published: true, category },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center space-x-2 mb-3 text-sm">
        <Link href="/" className="text-gray-400 hover:text-[#e63946]">
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#e63946] capitalize font-medium">{category}</span>
      </div>

      <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-gray-900 mb-8 capitalize pb-6 border-b border-gray-200">
        {category} News
      </h1>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                ...article,
                createdAt: article.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">
            No articles in this category yet.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-[#e63946] hover:underline font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}
