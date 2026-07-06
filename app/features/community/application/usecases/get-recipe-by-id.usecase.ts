import { ICommunityRepository } from "../../domain/repositories/community.repository";
import { RecipeEntity } from "../../domain/entities/community.entity";

export class GetRecipeByIdUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(id: string): Promise<RecipeEntity | null> {
    return this.communityRepository.findRecipeById(id);
  }
}
