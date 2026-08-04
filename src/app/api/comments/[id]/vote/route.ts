import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to vote" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { value } = await request.json();

    if (value !== 1 && value !== -1) {
      return Response.json(
        { error: "Value must be 1 (upvote) or -1 (downvote)" },
        { status: 400 }
      );
    }

    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.commentVote.delete({
          where: { id: existingVote.id },
        });
        return Response.json({ message: "Vote removed", userVote: 0 });
      } else {
        await prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        return Response.json({ message: "Vote updated", userVote: value });
      }
    }

    await prisma.commentVote.create({
      data: {
        userId: session.user.id,
        commentId: id,
        value,
      },
    });

    return Response.json({ message: "Vote recorded", userVote: value }, { status: 201 });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
