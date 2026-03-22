import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   post:
 *     summary: Like a comment
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

    const comment = await prisma.postComment.findUnique({ where: { id } });
    if (!comment) throw AppError.notFound("Comment not found");

    const existingLike = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId: user.userId } },
    });
    if (existingLike) throw AppError.badRequest("You have already liked this comment");

    await prisma.$transaction([
      prisma.commentLike.create({ data: { commentId: id, userId: user.userId } }),
      prisma.postComment.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
    ]);

    return successResponse(undefined, { message: "Comment liked successfully" });
  } catch (error) {
    return handleRouteError(error, "Like comment");
  }
}

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   delete:
 *     summary: Unlike a comment
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const comment = await prisma.postComment.findUnique({ where: { id } });
    if (!comment) throw AppError.notFound("Comment not found");

    const existingLike = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId: user.userId } },
    });
    if (!existingLike) throw AppError.badRequest("You have not liked this comment");

    await prisma.$transaction([
      prisma.commentLike.delete({ where: { commentId_userId: { commentId: id, userId: user.userId } } }),
      prisma.postComment.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
    ]);

    return successResponse(undefined, { message: "Comment unliked successfully" });
  } catch (error) {
    return handleRouteError(error, "Unlike comment");
  }
}
