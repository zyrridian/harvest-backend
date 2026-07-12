import { NextRequest } from "next/server";
import { handleRouteError, AppError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetRecipeByIdUseCase,
  communityRepository,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     description: Retrieve detailed information about a specific recipe
 *     tags:
 *       - Community
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
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
 *         description: Recipe not found
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const useCase = new GetRecipeByIdUseCase(communityRepository);
    const recipe = await useCase.execute(id);

    if (!recipe) {
      throw AppError.notFound("Recipe not found");
    }

    return successResponse(recipe);
  } catch (error) {
    return handleRouteError(error, "Get recipe by ID");
  }
}
