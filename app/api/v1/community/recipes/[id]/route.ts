import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError, AppError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetRecipeByIdUseCase,
  UpdateRecipeUseCase,
  DeleteRecipeUseCase,
  UpdateRecipeSchema,
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

/**
 * @swagger
 * /api/v1/community/recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     description: Update a recipe that you authored
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               prep_time_minutes:
 *                 type: integer
 *               cook_time_minutes:
 *                 type: integer
 *               servings:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *               is_featured:
 *                 type: boolean
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the author)
 *       404:
 *         description: Recipe not found
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = await props.params;
    const body = await request.json();
    
    const input = UpdateRecipeSchema.parse(body);

    const useCase = new UpdateRecipeUseCase(communityRepository);
    const recipe = await useCase.execute({
      id,
      authorId: user.userId,
      title: input.title,
      description: input.description,
      imageUrl: input.image_url,
      prepTimeMinutes: input.prep_time_minutes,
      cookTimeMinutes: input.cook_time_minutes,
      servings: input.servings,
      difficulty: input.difficulty,
      isFeatured: input.is_featured,
      instructions: input.instructions,
      ingredients: input.ingredients?.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        productId: i.product_id,
      })),
    });

    return successResponse(recipe, {
      message: "Recipe updated successfully",
      status: 200,
    });
  } catch (error) {
    return handleRouteError(error, "Update recipe");
  }
}

/**
 * @swagger
 * /api/v1/community/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     description: Delete a recipe that you authored
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
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the author)
 *       404:
 *         description: Recipe not found
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = await props.params;

    const useCase = new DeleteRecipeUseCase(communityRepository);
    await useCase.execute(id, user.userId);

    return successResponse(null, {
      message: "Recipe deleted successfully",
      status: 200,
    });
  } catch (error) {
    return handleRouteError(error, "Delete recipe");
  }
}
