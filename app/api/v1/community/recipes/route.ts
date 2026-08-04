import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetRecipesUseCase,
  CreateRecipeUseCase,
  communityRepository,
  GetRecipesQuerySchema,
  CreateRecipeSchema,
} from "@/features/community";

/**
 * @swagger
 * /api/v1/community/recipes:
 *   get:
 *     summary: Get recipes
 *     description: Retrieve a list of community recipes with filtering and pagination
 *     tags:
 *       - Community
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: author_id
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty (e.g., easy, medium, hard)
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: string
 *         description: Filter by featured status
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
 *         description: Recipes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryData = {
      search: searchParams.get("search") || undefined,
      author_id: searchParams.get("author_id") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      is_featured: searchParams.get("is_featured") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const input = GetRecipesQuerySchema.parse(queryData);

    const useCase = new GetRecipesUseCase(communityRepository);
    const result = await useCase.execute({
      search: input.search,
      authorId: input.author_id,
      difficulty: input.difficulty,
      isFeatured: input.is_featured,
      page: input.page,
      limit: input.limit,
    });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error, "Get recipes");
  }
}

/**
 * @swagger
 * /api/v1/community/recipes:
 *   post:
 *     summary: Create a recipe
 *     description: Create a new recipe in the community
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
 *               - instructions
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
 *                   type: object
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Recipe created successfully
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
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const body = await request.json();
    
    const input = CreateRecipeSchema.parse(body);

    const useCase = new CreateRecipeUseCase(communityRepository);
    const recipe = await useCase.execute({
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
      message: "Recipe created successfully",
      status: 201,
    });
  } catch (error) {
    return handleRouteError(error, "Create recipe");
  }
}
