import { ICommunityRepository } from "../../domain/repositories/community.repository";
import { CreateRecipeInputDTO } from "../dtos/community.dto";
import { RecipeEntity } from "../../domain/entities/community.entity";

export class CreateRecipeUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(input: CreateRecipeInputDTO): Promise<RecipeEntity> {
    return this.communityRepository.createRecipe({
      authorId: input.authorId,
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
