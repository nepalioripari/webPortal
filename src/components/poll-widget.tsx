"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface PollOption {
  id: string;
  text: string;
  _count: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export function PollWidget({ poll }: { poll: Poll }) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState(poll.options);

  const totalVotes = options.reduce((sum, opt) => sum + opt._count.votes, 0);

  async function handleVote() {
    if (!selected) return;
    if (!session) {
      setError("Please login to vote");
      return;
    }

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setOptions((prev) =>
        prev.map((opt) =>
          opt.id === selected
            ? { ...opt, _count: { votes: opt._count.votes + 1 } }
            : opt
        )
      );
      setVoted(true);
      setError("");
    } catch {
      setError("Failed to submit vote");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-base font-bold text-gray-900">{poll.question}</h3>
      </div>

      <div className="space-y-2.5">
        {options.map((option) => {
          const percentage =
            totalVotes > 0
              ? Math.round((option._count.votes / totalVotes) * 100)
              : 0;

          return (
            <div key={option.id}>
              {voted ? (
                <div className="relative overflow-hidden rounded-lg border border-gray-100">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100/50 transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex justify-between items-center p-3">
                    <span className="text-sm font-medium text-gray-700">
                      {option.text}
                    </span>
                    <span className="text-sm font-bold text-[#e63946]">
                      {percentage}%
                    </span>
                  </div>
                </div>
              ) : (
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selected === option.id
                      ? "border-[#e63946] bg-red-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option.id}
                    onChange={() => setSelected(option.id)}
                    className="mr-3 text-[#e63946] focus:ring-[#e63946]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.text}
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {!voted && (
        <button
          onClick={handleVote}
          disabled={!selected}
          className="mt-4 w-full bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Cast Vote
        </button>
      )}

      {voted && (
        <p className="mt-4 text-sm text-green-600 text-center font-medium bg-green-50 py-2 rounded-lg">
          ✓ Thanks for voting! ({totalVotes + 1} total votes)
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center bg-red-50 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
