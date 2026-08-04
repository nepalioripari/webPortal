import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    return Response.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title;
    if (body.content) data.content = body.content;
    if (body.excerpt !== undefined) data.excerpt = body.excerpt;
    if (body.category) data.category = body.category;
    if (body.country) data.country = body.country;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.published !== undefined) data.published = body.published;

    const article = await prisma.article.update({
      where: { id },
      data,
    });

    return Response.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.article.delete({ where: { id } });

    return Response.json({ message: "Article deleted" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
