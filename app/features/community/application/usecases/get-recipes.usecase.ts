import { ICommunityRepository } from "../../domain/repositories/community.repository";
import { GetRecipesInputDTO, PaginatedRecipesDTO } from "../dtos/community.dto";

export class GetRecipesUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(input: GetRecipesInputDTO): Promise<PaginatedRecipesDTO> {
    const { search, authorId, difficulty, isFeatured, page, limit } = input;

    const [recipes, total] = await Promise.all([
      this.communityRepository.findRecipes({
        search,
        authorId,
        difficulty,
        isFeatured,
        page,
        limit,
      }),
      this.communityRepository.countRecipes({
        search,
        authorId,
        difficulty,
        isFeatured,
        page,
        limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }
}
