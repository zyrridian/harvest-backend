import { ICommunityRepository } from "../../domain/repositories/community.repository";

export class GetTrendingTagsUseCase {
  constructor(private communityRepository: ICommunityRepository) {}

  async execute(limit: number = 10): Promise<string[]> {
    return this.communityRepository.getTrendingTags(limit);
  }
}
