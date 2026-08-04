import Link from "next/link";
import Image from "next/image";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    imageUrl: string | null;
    category: string;
    views: number;
    createdAt: string;
    author: { name: string; image: string | null };
    _count: { comments: number };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const categoryColors: Record<string, string> = {
    politics: "bg-blue-500",
    sports: "bg-green-500",
    technology: "bg-purple-500",
    entertainment: "bg-pink-500",
    business: "bg-amber-500",
    general: "bg-gray-500",
  };

  const badgeColor = categoryColors[article.category] || "bg-gray-500";

  return (
    <Link href={`/article/${article.id}`}>
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover group">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-300">
                <svg
                  className="w-14 h-14"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
            </div>
          )}
          <span
            className={`absolute top-3 left-3 ${badgeColor} text-white text-xs px-2.5 py-1 rounded-full capitalize font-medium shadow-sm`}
          >
            {article.category}
          </span>
        </div>
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-[#e63946] transition-colors duration-200">
            {article.title}
          </h2>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#457b9d] rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {article.author.name}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{article.views}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{article._count.comments}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
