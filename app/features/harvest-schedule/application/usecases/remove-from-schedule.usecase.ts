import { IHarvestScheduleRepository } from "../../domain/repositories/harvest-schedule.repository";

export class RemoveFromScheduleUseCase {
  constructor(private readonly harvestRepo: IHarvestScheduleRepository) {}

  async execute(userId: string, campaignId: string): Promise<void> {
    await this.harvestRepo.removeCampaignFromSchedule(userId, campaignId);
  }
}
