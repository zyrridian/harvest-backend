import { NextRequest } from "next/server";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetTrendingTagsUseCase,
  communityRepository,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/tags/trending:
 *   get:
 *     summary: Get trending tags
 *     description: Retrieve a list of the most popular community tags
 *     tags:
 *       - Community
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trending tags to return
 *     responses:
 *       200:
 *         description: Trending tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const useCase = new GetTrendingTagsUseCase(communityRepository);
    const tags = await useCase.execute(limit);

    return successResponse(tags);
  } catch (error) {
    return handleRouteError(error, "Get trending tags");
  }
}
