import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-4 hidden md:block">
          <div className="text-white text-xl font-bold mb-8 px-2">
            Admin Panel
          </div>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/articles"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            >
              📝 Articles
            </Link>
            <Link
              href="/admin/articles/new"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            >
              ➕ New Article
            </Link>
            <Link
              href="/admin/polls"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            >
              📊 Polls
            </Link>
            <hr className="border-gray-700 my-4" />
            <Link
              href="/"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition"
            >
              ← Back to Site
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
