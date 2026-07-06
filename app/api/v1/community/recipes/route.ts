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
