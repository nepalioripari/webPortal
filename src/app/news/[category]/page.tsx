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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/" className="text-gray-500 hover:text-red-600">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-red-600 capitalize font-medium">{category}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
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
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            No articles in this category yet.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-red-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}
