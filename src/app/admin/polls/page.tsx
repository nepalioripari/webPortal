"use client";

import { useState, useEffect } from "react";

interface PollOption {
  id: string;
  text: string;
  _count: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  active: boolean;
  createdAt: string;
  options: PollOption[];
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPolls();
  }, []);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    if (res.ok) {
      const data = await res.json();
      setPolls(data);
    }
  }

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setError("At least 2 options are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: validOptions }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
      } else {
        setQuestion("");
        setOptions(["", ""]);
        fetchPolls();
      }
    } catch {
      setError("Failed to create poll");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Polls</h1>

      {/* Create Poll Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Poll</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="What do you want to ask?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Option
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </div>

      {/* Existing Polls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Active Polls</h2>
        </div>
        <div className="divide-y">
          {polls.length > 0 ? (
            polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, opt) => sum + opt._count.votes,
                0
              );
              return (
                <div key={poll.id} className="p-4">
                  <p className="font-medium text-gray-900">{poll.question}</p>
                  <div className="mt-2 space-y-1">
                    {poll.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>{opt.text}</span>
                        <span>
                          {opt._count.votes} votes (
                          {totalVotes > 0
                            ? Math.round((opt._count.votes / totalVotes) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Total votes: {totalVotes}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No polls created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
