import { NextRequest } from "next/server";
import { handleRouteError, AppError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetRecipeByIdUseCase,
  communityRepository,
} from "@/features/community";

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
