import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { PollWidget } from "@/components/poll-widget";
import { NepaliCalendar } from "@/components/nepali-calendar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, polls] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 9,
    }),
    prisma.poll.findMany({
      where: { active: true },
      include: {
        options: {
          include: { _count: { select: { votes: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);

  const categories = [
    { name: "politics", emoji: "🏛️" },
    { name: "sports", emoji: "⚽" },
    { name: "technology", emoji: "💻" },
    { name: "entertainment", emoji: "🎬" },
    { name: "business", emoji: "💼" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <section className="mb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1d3557] via-[#457b9d] to-[#1d3557] rounded-2xl p-8 md:p-12 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtNHYySDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
          <div className="relative">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
              Nepali<span className="text-[#e63946]">oripari</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-xl leading-relaxed">
              Your trusted source for the latest news from Nepal and beyond
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="#latest"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20"
              >
                Latest News →
              </a>
              <Link
                href="/polls"
                className="text-blue-200 hover:text-white text-sm font-medium"
              >
                Take a Poll
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-[#e63946] text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md"
          >
            All News
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/news/${cat.name}`}
              className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-[#e63946] hover:text-[#e63946] shadow-sm"
            >
              {cat.emoji} <span className="capitalize">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 id="latest" className="text-2xl font-bold text-gray-900">Latest News</h2>
            <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-[#e63946] to-transparent rounded-full opacity-30"></div>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">📰</div>
              <p className="text-gray-500 text-lg font-medium">
                No news articles yet.
              </p>
              <p className="text-gray-400 mt-1">
                Check back soon for the latest updates!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Poll */}
          {polls.length > 0 && <PollWidget poll={polls[0]} />}

          {/* Nepali Calendar */}
          <NepaliCalendar />

        </aside>
      </div>
    </div>
  );
}
