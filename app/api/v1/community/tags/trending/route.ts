import { NextRequest } from "next/server";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import {
  GetTrendingTagsUseCase,
  communityRepository,
} from "@/features/community";

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
