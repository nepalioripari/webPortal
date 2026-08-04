import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const { content, articleId, fbEmbedUrl } = await request.json();

    if (!content || !articleId) {
      return Response.json(
        { error: "Content and articleId are required" },
        { status: 400 }
      );
    }

    // Validate Facebook embed URL if provided
    if (fbEmbedUrl && !fbEmbedUrl.includes("facebook.com")) {
      return Response.json(
        { error: "Invalid Facebook URL" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        userId: session.user.id,
        fbEmbedUrl: fbEmbedUrl || null,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
