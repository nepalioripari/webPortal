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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Admin Actions */}
      {isAdmin && <ArticleActions articleId={article.id} />}

      <article>
        {/* Category Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full capitalize">
            {article.category}
          </span>
          {article.country && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              📍 {article.country}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Meta + Views */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <span>By {article.author.name}</span>
          <span>•</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <ViewCounter articleId={article.id} views={article.views} />
        </div>

        {/* Content with Like/Dislike */}
        <div className="mb-6">
          <VoteButtons
            type="article"
            id={article.id}
            initialScore={articleScore}
            initialUserVote={userArticleVote}
          />
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
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
        <div className="prose prose-lg max-w-none">
          {article.content.split("\n").map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">
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
