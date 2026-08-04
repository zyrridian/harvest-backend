import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetPostByIdUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  communityRepository,
  UpdatePostSchema,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve detailed information about a specific community post
 *     tags:
 *       - Community
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Post not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let currentUserId: string | undefined;
    try {
      const user = await verifyAuth(request);
      currentUserId = user.userId;
    } catch {
      // Allow unauthenticated access
    }

    const useCase = new GetPostByIdUseCase(communityRepository);
    const post = await useCase.execute(id, currentUserId);

    return successResponse(post);
  } catch (error) {
    return handleRouteError(error, "Get community post");
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     description: Update the title and content of a specific community post
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
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

    const input = UpdatePostSchema.parse(body);

    const useCase = new UpdatePostUseCase(communityRepository);
    const updated = await useCase.execute({
      id,
      userId: user.userId,
      title: input.title,
      content: input.content,
    });

    return successResponse(updated, { message: "Post updated successfully" });
  } catch (error) {
    return handleRouteError(error, "Update community post");
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Delete a specific community post
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
 *         description: Post deleted successfully
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

    const useCase = new DeletePostUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(undefined, { message: "Post deleted successfully" });
  } catch (error) {
    return handleRouteError(error, "Delete community post");
  }
}
