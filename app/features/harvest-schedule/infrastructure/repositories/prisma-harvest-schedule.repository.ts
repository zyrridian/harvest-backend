import { IHarvestScheduleRepository, ScheduledCampaign } from "../../domain/repositories/harvest-schedule.repository";
import prisma from "@/core/database/prisma";

export class PrismaHarvestScheduleRepository implements IHarvestScheduleRepository {
  async getUserScheduledCampaigns(userId: string, targetMonth: Date, latitude?: number, longitude?: number): Promise<ScheduledCampaign[]> {
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    // Get manually scheduled campaigns
    const scheduled = await prisma.userCampaignSchedule.findMany({
      where: {
        userId,
        campaign: {
          estimatedHarvestDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      },
      select: { campaignId: true }
    });

    // Get farmer followed campaigns
    const followedFarmers = await prisma.farmerFollower.findMany({
      where: { userId },
      select: { farmerId: true }
    });
    
    // Get campaigns actually reserved by the user
    const reserved = await prisma.preorderReservation.findMany({
      where: { userId, status: { not: "CANCELLED" } },
      select: { campaignId: true }
    });

    const scheduledIds = scheduled.map(s => s.campaignId);
    const reservedIds = reserved.map(r => r.campaignId);
    const farmerIds = followedFarmers.map(f => f.farmerId);

    let campaigns = await prisma.preorderCampaign.findMany({
      where: {
        estimatedHarvestDate: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        OR: [
          { id: { in: scheduledIds } },
          { id: { in: reservedIds } },
          { farmerId: { in: farmerIds } }
        ]
      },
      include: {
        farmer: true
      },
      orderBy: {
        estimatedHarvestDate: 'asc'
      }
    });

    if (latitude && longitude) {
      campaigns = campaigns.map((c) => {
        if (c.farmer?.latitude && c.farmer?.longitude) {
          (c as any).distance = this.calculateDistance(
            latitude,
            longitude,
            c.farmer.latitude,
            c.farmer.longitude
          );
        }
        return c;
      });
    }

    return campaigns.map(c => ({
      ...c,
      isReservedByMe: reservedIds.includes(c.id)
    })) as ScheduledCampaign[];
  }

  async addCampaignToSchedule(userId: string, campaignId: string, remindersEnabled: boolean = true): Promise<void> {
    await prisma.userCampaignSchedule.upsert({
      where: {
        userId_campaignId: {
          userId,
          campaignId
        }
      },
      update: {
        remindersEnabled
      },
      create: {
        userId,
        campaignId,
        remindersEnabled
      }
    });
  }

  async removeCampaignFromSchedule(userId: string, campaignId: string): Promise<void> {
    await prisma.userCampaignSchedule.deleteMany({
      where: {
        userId,
        campaignId
      }
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}

export const harvestScheduleRepository = new PrismaHarvestScheduleRepository();
