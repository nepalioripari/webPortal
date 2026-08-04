import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return Response.json({ message: "View recorded" });
  } catch (error) {
    console.error("Error recording view:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
