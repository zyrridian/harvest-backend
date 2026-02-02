import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Post not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    let userId: string | undefined;
    try {
      const user = await verifyAuth(request);
      userId = user.userId;
    } catch (error) {
      // Allow unauthenticated access
    }

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

    const [comments, total] = await Promise.all([
      prisma.postComment.findMany({
        where: { postId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      }),
      prisma.postComment.count({
        where: { postId: id },
      }),
    ]);

    // Check which comments the user has liked
    let commentsWithLikeStatus = comments;
    if (userId) {
      const userLikes = await prisma.commentLike.findMany({
        where: {
          userId,
          commentId: {
            in: comments.map((c) => c.id),
          },
        },
        select: { commentId: true },
      });

      const likedCommentIds = new Set(userLikes.map((l) => l.commentId));

      commentsWithLikeStatus = comments.map((comment) => ({
        ...comment,
        is_liked_by_user: likedCommentIds.has(comment.id),
      }));
    }

    return NextResponse.json({
      status: "success",
      data: {
        comments: commentsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to get comments",
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    const body = await request.json();

    const { content } = body;

    if (!content) {
      return NextResponse.json(
        {
          status: "error",
          message: "Content is required",
        },
        { status: 400 },
      );
    }

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

    const [comment] = await prisma.$transaction([
      prisma.postComment.create({
        data: {
          postId: id,
          userId: user.userId,
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.communityPost.update({
        where: { id },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        status: "success",
        message: "Comment added successfully",
        data: comment,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to add comment",
      },
      { status: error.status || 500 },
    );
  }
}
