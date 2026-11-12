import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const articles = query
    ? await prisma.article.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: { select: { name: true, image: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <p className="kicker text-[#e63946]">Search</p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          {query ? (
            <>
              Results for &ldquo;{query}&rdquo;
            </>
          ) : (
            "Search Nepalioripari"
          )}
        </h1>
        {query && (
          <p className="text-gray-500 mt-2">
            {articles.length} {articles.length === 1 ? "article" : "articles"} found
          </p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">
            Type something in the search bar to find articles.
          </p>
        </div>
      ) : articles.length > 0 ? (
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
            No articles found for &ldquo;{query}&rdquo;.
          </p>
          <p className="text-gray-400 mt-1">Try a different keyword.</p>
        </div>
      )}
    </div>
  );
}
