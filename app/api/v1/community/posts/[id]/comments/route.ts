import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetPostCommentsUseCase,
  AddCommentUseCase,
  communityRepository,
  AddCommentSchema,
  AdminCommunityPaginationSchema as PaginationSchema, // Reusing generic pagination
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve comments for a specific community post with pagination
 *     tags:
 *       - Community
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
    const { searchParams } = new URL(request.url);

    const queryData = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };
    const input = PaginationSchema.parse(queryData);

    let currentUserId: string | undefined;
    try {
      const user = await verifyAuth(request);
      currentUserId = user.userId;
    } catch {
      // Allow unauthenticated access
    }

    const useCase = new GetPostCommentsUseCase(communityRepository);
    const result = await useCase.execute({
      postId: id,
      page: input.page,
      limit: input.limit,
      currentUserId,
    });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error, "Get comments");
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     description: Add a new comment or reply to an existing comment on a post
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               reply_to_user_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
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
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    const body = await request.json();

    const input = AddCommentSchema.parse(body);

    const useCase = new AddCommentUseCase(communityRepository);
    const comment = await useCase.execute({
      postId: id,
      userId: user.userId,
      content: input.content,
      parentId: input.parent_id,
      replyToUserId: input.reply_to_user_id,
    });

    return successResponse(comment, {
      message: "Comment added successfully",
      status: 201,
    });
  } catch (error) {
    return handleRouteError(error, "Add comment");
  }
}
