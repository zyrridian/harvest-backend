import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   get:
 *     summary: Get a community post by ID
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let userId: string | undefined;
    try {
      const user = await verifyAuth(request);
      userId = user.userId;
    } catch (error) {
      // Allow unauthenticated access
    }

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    let isLikedByUser = false;
    if (userId) {
      const like = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId,
          },
        },
      });
      isLikedByUser = !!like;
    }

    return NextResponse.json({
      status: "success",
      data: {
        ...post,
        is_liked_by_user: isLikedByUser,
      },
    });
  } catch (error: any) {
    console.error("Get community post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to get post",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   put:
 *     summary: Update a community post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    const body = await request.json();

    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    if (post.userId !== user.userId) {
      return NextResponse.json(
        {
          status: "error",
          message: "You do not have permission to update this post",
        },
        { status: 403 },
      );
    }

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;

    const updated = await prisma.communityPost.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        images: true,
        tags: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Post updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update community post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to update post",
      },
      { status: error.status || 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   delete:
 *     summary: Delete a community post
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Post not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    if (post.userId !== user.userId) {
      return NextResponse.json(
        {
          status: "error",
          message: "You do not have permission to delete this post",
        },
        { status: 403 },
      );
    }

    await prisma.communityPost.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete community post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete post",
      },
      { status: error.status || 500 },
    );
  }
}
