import { AppError } from "@/core/errors";
import { ICommunityRepository } from "../../domain/repositories/community.repository";

export class DeleteRecipeUseCase {
  constructor(private readonly communityRepository: ICommunityRepository) {}

  async execute(recipeId: string, authorId: string): Promise<void> {
    const recipe = await this.communityRepository.findRecipeById(recipeId);
    if (!recipe) {
      throw AppError.notFound("Recipe not found");
    }

    if (recipe.authorId !== authorId) {
      throw AppError.forbidden("You do not have permission to delete this recipe");
    }

    await this.communityRepository.deleteRecipe(recipeId);
  }
}
