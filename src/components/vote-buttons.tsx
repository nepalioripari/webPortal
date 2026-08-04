"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface VoteButtonsProps {
  type: "article" | "comment";
  id: string;
  initialScore: number;
  initialUserVote: number;
}

export function VoteButtons({
  type,
  id,
  initialScore,
  initialUserVote,
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  const likes = Math.max(0, Math.ceil((score + Math.abs(score)) / 2) + (score >= 0 ? 0 : 0));
  const dislikes = Math.max(0, likes - score);

  // Simpler: track likes/dislikes from score + userVote
  const totalVotes = Math.abs(score) + Math.max(0, score >= 0 ? dislikes : likes);

  async function handleVote(value: number) {
    if (!session) return;
    if (loading) return;

    setLoading(true);

    const url =
      type === "article"
        ? `/api/articles/${id}/vote`
        : `/api/comments/${id}/vote`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        const data = await res.json();
        const newUserVote = data.userVote;
        const oldContribution = userVote;
        const newContribution = newUserVote;
        setScore(score - oldContribution + newContribution);
        setUserVote(newUserVote);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Like */}
      <button
        onClick={() => handleVote(1)}
        disabled={!session || loading}
        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition ${
          userVote === 1
            ? "text-green-600 bg-green-50"
            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title={session ? (userVote === 1 ? "Remove like" : "Like") : "Login to like"}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill={userVote === 1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zm-9 11H4a2 2 0 01-2-2v-7a2 2 0 012-2h1"
          />
        </svg>
        <span className="text-sm font-medium">{score >= 0 ? score : 0}</span>
      </button>

      {/* Dislike */}
      <button
        onClick={() => handleVote(-1)}
        disabled={!session || loading}
        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition ${
          userVote === -1
            ? "text-red-500 bg-red-50"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title={session ? (userVote === -1 ? "Remove dislike" : "Dislike") : "Login to dislike"}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill={userVote === -1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zm9-13h1a2 2 0 012 2v7a2 2 0 01-2 2h-1"
          />
        </svg>
        <span className="text-sm font-medium">{score < 0 ? Math.abs(score) : 0}</span>
      </button>
    </div>
  );
}
