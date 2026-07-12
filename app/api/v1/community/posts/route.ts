import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetPostsUseCase,
  CreatePostUseCase,
  communityRepository,
  GetPostsQuerySchema,
  CreatePostSchema,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/posts:
 *   get:
 *     summary: Get community posts
 *     description: Retrieve a list of community posts with optional filtering and pagination
 *     tags:
 *       - Community
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter type
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: farmer_id
 *         schema:
 *           type: string
 *         description: Filter by farmer ID
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
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryData = {
      filter: searchParams.get("filter") || undefined,
      tag: searchParams.get("tag") || undefined,
      farmer_id: searchParams.get("farmer_id") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const input = GetPostsQuerySchema.parse(queryData);

    let currentUserId: string | undefined;
    try {
      const user = await verifyAuth(request);
      currentUserId = user.userId;
    } catch {
      // Allow unauthenticated access
    }

    const useCase = new GetPostsUseCase(communityRepository);
    const result = await useCase.execute({
      filter: input.filter,
      tag: input.tag,
      farmerId: input.farmer_id,
      page: input.page,
      limit: input.limit,
      currentUserId,
    });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error, "Get community posts");
  }
}

/**
 * @swagger
 * /api/v1/community/posts:
 *   post:
 *     summary: Create a community post
 *     description: Create a new post in the community
 *     tags:
 *       - Community
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: My first post
 *               content:
 *                 type: string
 *                 example: This is the content of my post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const body = await request.json();
    
    const input = CreatePostSchema.parse(body);

    const useCase = new CreatePostUseCase(communityRepository);
    const post = await useCase.execute({
      title: input.title,
      content: input.content,
      images: input.images,
      tags: input.tags,
      userId: user.userId,
    });

    return successResponse(post, {
      message: "Post created successfully",
      status: 201,
    });
  } catch (error) {
    return handleRouteError(error, "Create community post");
  }
}
