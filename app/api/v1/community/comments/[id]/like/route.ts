import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  LikeCommentUseCase,
  UnlikeCommentUseCase,
  communityRepository,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   post:
 *     summary: Like a comment
 *     description: Like a specific comment
 *     tags:
 *       - Community
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const useCase = new LikeCommentUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, {
      message: "Comment liked successfully",
    });
  } catch (error) {
    return handleRouteError(error, "Like comment");
  }
}

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   delete:
 *     summary: Unlike a comment
 *     description: Remove a like from a specific comment
 *     tags:
 *       - Community
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const useCase = new UnlikeCommentUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, {
      message: "Comment unliked successfully",
    });
  } catch (error) {
    return handleRouteError(error, "Unlike comment");
  }
}
