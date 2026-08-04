import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to vote" },
        { status: 401 }
      );
    }

    const { optionId } = await request.json();

    if (!optionId) {
      return Response.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if user already voted on this poll
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: { include: { options: true } } },
    });

    if (!option) {
      return Response.json(
        { error: "Poll option not found" },
        { status: 404 }
      );
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        pollOption: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return Response.json(
        { error: "You have already voted on this poll" },
        { status: 409 }
      );
    }

    await prisma.vote.create({
      data: {
        userId: session.user.id,
        pollOptionId: optionId,
      },
    });

    return Response.json({ message: "Vote recorded" }, { status: 201 });
  } catch (error) {
    console.error("Error voting:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
