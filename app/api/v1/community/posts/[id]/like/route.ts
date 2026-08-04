import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  LikePostUseCase,
  UnlikePostUseCase,
  communityRepository,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     description: Like a specific community post
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
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
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
 *         description: Post not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const useCase = new LikePostUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, { message: "Post liked successfully" });
  } catch (error) {
    return handleRouteError(error, "Like post");
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}/like:
 *   delete:
 *     summary: Unlike a post
 *     description: Remove a like from a specific community post
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
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
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
 *         description: Post not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const useCase = new UnlikePostUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, { message: "Post unliked successfully" });
  } catch (error) {
    return handleRouteError(error, "Unlike post");
  }
}
