import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CommentSection } from "@/components/comment-section";
import { ArticleActions } from "@/components/admin/article-actions";
import { VoteButtons } from "@/components/vote-buttons";
import { ViewCounter } from "@/components/view-counter";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, session] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    auth(),
  ]);

  if (!article || !article.published) {
    notFound();
  }

  const [articleVotes, commentVotes] = await Promise.all([
    prisma.articleVote.findMany({ where: { articleId: id } }),
    prisma.commentVote.findMany({
      where: { commentId: { in: article.comments.map((c) => c.id) } },
    }),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  // Calculate article vote score
  const articleScore = articleVotes.reduce((sum, v) => sum + v.value, 0);
  const userArticleVote = session
    ? articleVotes.find((v) => v.userId === session.user.id)?.value || 0
    : 0;

  // Prepare comments with vote data
  const commentsWithVotes = article.comments.map((c) => {
    const cVotes = commentVotes.filter((v) => v.commentId === c.id);
    const commentScore = cVotes.reduce((sum, v) => sum + v.value, 0);
    const userCommentVote = session
      ? cVotes.find((v) => v.userId === session.user.id)?.value || 0
      : 0;
    return {
      id: c.id,
      content: c.content,
      fbEmbedUrl: c.fbEmbedUrl,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      score: commentScore,
      userVote: userCommentVote,
    };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Admin Actions */}
      {isAdmin && <ArticleActions articleId={article.id} />}

      <article>
        {/* Category Badge */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="kicker text-[#e63946]">{article.category}</span>
          {article.country && (
            <span className="text-xs text-gray-400">📍 {article.country}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-6">
            {article.excerpt}
          </p>
        )}

        {/* Meta + Views */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-gray-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#457b9d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {article.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{article.author.name}</p>
              <p className="text-gray-400">
                {new Date(article.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ViewCounter articleId={article.id} views={article.views} />
            <VoteButtons
              type="article"
              id={article.id}
              initialScore={articleScore}
              initialUserVote={userArticleVote}
            />
          </div>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="relative w-full h-64 md:h-[28rem] mb-8 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none font-serif-display">
          {article.content.split("\n").map((paragraph, i) => (
            <p key={i} className="text-gray-800 leading-relaxed mb-5 text-[1.05rem]">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      {/* Comments */}
      <CommentSection
        articleId={article.id}
        initialComments={commentsWithVotes}
      />
    </div>
  );
}
