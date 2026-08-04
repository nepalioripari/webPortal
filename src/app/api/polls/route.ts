import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const polls = await prisma.poll.findMany({
      where: { active: true },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, options } = await request.json();

    if (!question || !options || options.length < 2) {
      return Response.json(
        { error: "Question and at least 2 options are required" },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        options: {
          create: options.map((text: string) => ({ text })),
        },
      },
      include: {
        options: true,
      },
    });

    return Response.json(poll, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
