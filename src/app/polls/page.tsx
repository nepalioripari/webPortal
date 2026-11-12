import { prisma } from "@/lib/prisma";
import { PollWidget } from "@/components/poll-widget";

export default async function PollsPage() {
  const polls = await prisma.poll.findMany({
    where: { active: true },
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <p className="kicker text-[#e63946]">Community</p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          Active Polls
        </h1>
      </div>

      {polls.length > 0 ? (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollWidget key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">No active polls right now.</p>
          <p className="text-gray-400 mt-2">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
