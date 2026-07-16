import { IHarvestScheduleRepository } from "../../domain/repositories/harvest-schedule.repository";

export class AddToScheduleUseCase {
  constructor(private readonly harvestRepo: IHarvestScheduleRepository) {}

  async execute(userId: string, campaignId: string, remindersEnabled: boolean = true): Promise<void> {
    await this.harvestRepo.addCampaignToSchedule(userId, campaignId, remindersEnabled);
  }
}
