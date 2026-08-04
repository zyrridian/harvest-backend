import { AppError } from "@/core/errors";
import { ICommunityRepository } from "../../domain/repositories/community.repository";
import { UpdateRecipeInputDTO } from "../dtos/community.dto";
import { RecipeEntity } from "../../domain/entities/community.entity";

export class UpdateRecipeUseCase {
  constructor(private readonly communityRepository: ICommunityRepository) {}

  async execute(input: UpdateRecipeInputDTO): Promise<RecipeEntity> {
    const recipe = await this.communityRepository.findRecipeById(input.id);
    if (!recipe) {
      throw AppError.notFound("Recipe not found");
    }

    if (recipe.authorId !== input.authorId) {
      throw AppError.forbidden("You do not have permission to update this recipe");
    }

    return this.communityRepository.updateRecipe(input.id, {
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      prepTimeMinutes: input.prepTimeMinutes,
      cookTimeMinutes: input.cookTimeMinutes,
      servings: input.servings,
      difficulty: input.difficulty,
      isFeatured: input.isFeatured,
      instructions: input.instructions,
      ingredients: input.ingredients,
    });
  }
}
