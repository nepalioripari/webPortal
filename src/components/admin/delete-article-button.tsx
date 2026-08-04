"use client";

import { useRouter } from "next/navigation";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this article?")) return;

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 text-sm"
    >
      Delete
    </button>
  );
}
