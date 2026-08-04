import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  DeleteCommentUseCase,
  communityRepository,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a specific comment by ID
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
 *         description: Comment deleted successfully
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

    const useCase = new DeleteCommentUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, {
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return handleRouteError(error, "Delete comment");
  }
}
