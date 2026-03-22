import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

/**
 * @swagger
 * /api/v1/community/comments/{id}:
 *   delete:
 *     summary: Delete a comment
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
    if (comment.userId !== user.userId) throw AppError.forbidden("Not authorized to delete this comment");

    await prisma.$transaction([
      prisma.postComment.delete({ where: { id } }),
      prisma.communityPost.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    return successResponse(undefined, { message: "Comment deleted successfully" });
  } catch (error) {
    return handleRouteError(error, "Delete comment");
  }
}
