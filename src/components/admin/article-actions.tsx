"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function ArticleActions({ articleId }: { articleId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) {
      return;
    }

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
      <div className="flex items-center space-x-2 text-sm text-amber-700 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Admin</span>
      </div>
      <div className="h-4 w-px bg-amber-200"></div>
      <Link
        href={`/admin/articles/${articleId}/edit`}
        className="inline-flex items-center space-x-1.5 bg-white text-[#457b9d] border border-[#457b9d]/20 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-[#457b9d] hover:text-white shadow-sm"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Edit</span>
      </Link>
      <button
        onClick={handleDelete}
        className="inline-flex items-center space-x-1.5 bg-white text-red-600 border border-red-200 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white shadow-sm"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete</span>
      </button>
    </div>
  );
}
