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

    // Check if user already voted
    const existingVote = await prisma.articleVote.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote — remove it (toggle off)
        await prisma.articleVote.delete({
          where: { id: existingVote.id },
        });
        return Response.json({ message: "Vote removed", userVote: 0 });
      } else {
        // Different vote — update it
        await prisma.articleVote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        return Response.json({ message: "Vote updated", userVote: value });
      }
    }

    // New vote
    await prisma.articleVote.create({
      data: {
        userId: session.user.id,
        articleId: id,
        value,
      },
    });

    return Response.json({ message: "Vote recorded", userVote: value }, { status: 201 });
  } catch (error) {
    console.error("Error voting on article:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const votes = await prisma.articleVote.findMany({
      where: { articleId: id },
    });

    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;
    const score = upvotes - downvotes;

    let userVote = 0;
    if (session) {
      const myVote = votes.find((v) => v.userId === session.user.id);
      if (myVote) userVote = myVote.value;
    }

    return Response.json({ score, upvotes, downvotes, userVote });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
