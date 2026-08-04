import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [articleCount, userCount, commentCount, pollCount] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.poll.count(),
  ]);

  const recentArticles = await prisma.article.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Articles</p>
          <p className="text-3xl font-bold text-red-600">{articleCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-blue-600">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Comments</p>
          <p className="text-3xl font-bold text-green-600">{commentCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Active Polls</p>
          <p className="text-3xl font-bold text-purple-600">{pollCount}</p>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Articles</h2>
        </div>
        <div className="divide-y">
          {recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <p className="text-sm text-gray-500">
                    By {article.author.name} •{" "}
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    article.published
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {article.published ? "Published" : "Draft"}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No articles yet. Create your first article!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
