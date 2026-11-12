import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { PollWidget } from "@/components/poll-widget";
import { NepaliCalendar } from "@/components/nepali-calendar";
import Link from "next/link";
import Image from "next/image";

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

  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 3);
  const grid = rest.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Masthead */}
      <section className="mb-8 text-center">
        <p className="kicker text-[#e63946]">Bridging Nepalis Worldwide</p>
        <h1 className="font-serif-display text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mt-2">
          Nepali<span className="text-[#e63946]">oripari</span>
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mt-3 leading-relaxed">
          Your trusted source for the latest news from Nepal and beyond
        </p>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <div className="flex flex-wrap justify-center gap-2 border-y border-gray-200 py-3">
          <Link
            href="/"
            className="px-4 py-1.5 bg-[#e63946] text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md"
          >
            All News
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/news/${cat.name}`}
              className="px-4 py-1.5 bg-transparent text-gray-600 rounded-full text-sm font-medium border border-transparent hover:border-[#e63946] hover:text-[#e63946]"
            >
              {cat.emoji} <span className="capitalize">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {lead ? (
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead story */}
          <Link href={`/article/${lead.id}`} className="lg:col-span-2 group">
            <article className="relative overflow-hidden rounded-2xl shadow-lg h-[320px] md:h-[440px] bg-gradient-to-br from-[#1d3557] to-[#457b9d]">
              {lead.imageUrl && (
                <Image
                  src={lead.imageUrl}
                  alt={lead.title}
                  fill
                  priority
                  className="object-cover opacity-90 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <span className="kicker text-red-300">{lead.category}</span>
                <h2 className="font-serif-display text-2xl md:text-4xl font-bold text-white leading-tight mt-2 max-w-2xl group-hover:underline underline-offset-4">
                  {lead.title}
                </h2>
                <p className="text-blue-100/90 text-sm md:text-base mt-3 max-w-xl line-clamp-2">
                  {lead.excerpt}
                </p>
                <p className="text-blue-200/70 text-xs mt-4">
                  By {lead.author.name} · {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            </article>
          </Link>

          {/* Secondary headlines */}
          <div className="flex flex-col divide-y divide-gray-200">
            {secondary.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="group py-4 first:pt-0"
              >
                <span className="kicker text-[#457b9d]">{article.category}</span>
                <h3 className="font-serif-display text-base font-bold text-gray-900 leading-snug mt-1.5 group-hover:text-[#e63946]">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mb-12">
          <div className="text-4xl mb-3">📰</div>
          <p className="text-gray-500 text-lg font-medium">No news articles yet.</p>
          <p className="text-gray-400 mt-1">Check back soon for the latest updates!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 id="latest" className="font-serif-display text-2xl font-bold text-gray-900">More Headlines</h2>
            <div className="rule flex-1 ml-4 text-gray-300"></div>
          </div>

          {grid.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grid.map((article) => (
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
            lead && (
              <p className="text-gray-400 text-sm">That&apos;s all for now — check back soon for more.</p>
            )
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
