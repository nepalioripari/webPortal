"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FacebookEmbed } from "@/components/facebook-embed";
import { VoteButtons } from "@/components/vote-buttons";

interface Comment {
  id: string;
  content: string;
  fbEmbedUrl: string | null;
  createdAt: string;
  user: { name: string; image: string | null };
  score: number;
  userVote: number;
}

export function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: Comment[];
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [fbEmbedUrl, setFbEmbedUrl] = useState("");
  const [showFbInput, setShowFbInput] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          articleId,
          fbEmbedUrl: fbEmbedUrl || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      const newComment = await res.json();
      setComments([
        { ...newComment, score: 0, userVote: 0 },
        ...comments,
      ]);
      setContent("");
      setFbEmbedUrl("");
      setShowFbInput(false);
    } catch {
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10 pt-8 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <svg className="w-5 h-5 text-[#457b9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Comments ({comments.length})</span>
      </h3>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50/80 rounded-xl p-5 border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 bg-[#457b9d] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {session.user.name}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#457b9d]/20 focus:border-[#457b9d] bg-white"
            rows={3}
          />

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => setShowFbInput(!showFbInput)}
              className={`text-sm flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                showFbInput
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Embed FB Post</span>
            </button>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-[#457b9d] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1d3557] disabled:opacity-40 disabled:hover:bg-[#457b9d]"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>

          {showFbInput && (
            <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <input
                type="url"
                value={fbEmbedUrl}
                onChange={(e) => setFbEmbedUrl(e.target.value)}
                placeholder="https://www.facebook.com/..."
                className="w-full p-2.5 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-400 bg-white"
              />
              <p className="text-xs text-blue-500/70 mt-1.5">
                Paste a public Facebook post URL to embed it with your comment
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-3 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            <a href="/login" className="text-[#e63946] hover:underline font-medium">
              Sign in
            </a>{" "}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#457b9d] to-[#1d3557] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {comment.user.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Comment Vote */}
              <VoteButtons
                type="comment"
                id={comment.id}
                initialScore={comment.score}
                initialUserVote={comment.userVote}
              />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {comment.content}
            </p>

            {/* Facebook Embed */}
            {comment.fbEmbedUrl && (
              <div className="mt-4 pt-3 border-t border-gray-50">
                <FacebookEmbed url={comment.fbEmbedUrl} />
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-gray-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
