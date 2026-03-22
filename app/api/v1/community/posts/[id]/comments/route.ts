import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";
import { parsePagination, buildPaginationMeta } from "@/lib/helpers/pagination";

/**
 * @swagger
 * /api/v1/community/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Community]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    let userId: string | undefined;
    try {
      const user = await verifyAuth(request);
      userId = user.userId;
    } catch {
      // Allow unauthenticated access
    }

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw AppError.notFound("Post not found");

    const [comments, total] = await Promise.all([
      prisma.postComment.findMany({
        where: { postId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.postComment.count({ where: { postId: id } }),
    ]);

    let commentsWithLikeStatus = comments.map((c) => ({ ...c, is_liked_by_user: false }));
    if (userId) {
      const userLikes = await prisma.commentLike.findMany({
        where: { userId, commentId: { in: comments.map((c) => c.id) } },
        select: { commentId: true },
      });
      const likedCommentIds = new Set(userLikes.map((l) => l.commentId));
      commentsWithLikeStatus = comments.map((comment) => ({
        ...comment,
        is_liked_by_user: likedCommentIds.has(comment.id),
      }));
    }

    return successResponse({
      comments: commentsWithLikeStatus,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    return handleRouteError(error, "Get comments");
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

    if (!content) throw AppError.badRequest("Content is required");

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw AppError.notFound("Post not found");

    const [comment] = await prisma.$transaction([
      prisma.postComment.create({
        data: { postId: id, userId: user.userId, content },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.communityPost.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return successResponse(comment, { message: "Comment added successfully", status: 201 });
  } catch (error) {
    return handleRouteError(error, "Add comment");
  }
}
