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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Polls</h1>

      {polls.length > 0 ? (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollWidget key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No active polls right now.</p>
          <p className="text-gray-400 mt-2">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
