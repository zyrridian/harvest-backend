import { PreorderCampaign, Farmer, UserCampaignSchedule, PreorderReservation } from "@/generated/prisma/client";

export type ScheduledCampaign = PreorderCampaign & {
  farmer: Farmer;
  distance?: number;
  isReservedByMe?: boolean;
};

export interface IHarvestScheduleRepository {
  getUserScheduledCampaigns(userId: string, targetMonth: Date, latitude?: number, longitude?: number): Promise<ScheduledCampaign[]>;
  addCampaignToSchedule(userId: string, campaignId: string, remindersEnabled?: boolean): Promise<void>;
  removeCampaignFromSchedule(userId: string, campaignId: string): Promise<void>;
}
