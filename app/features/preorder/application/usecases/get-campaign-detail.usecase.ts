import { IPreOrderRepository } from "../../domain/repositories/preorder.repository";

export class GetCampaignDetailUseCase {
  constructor(private readonly preorderRepo: IPreOrderRepository) {}

  async execute(campaignId: string, userId: string, latitude?: number, longitude?: number): Promise<any> {
    const campaign = await this.preorderRepo.findCampaignById(campaignId);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const hasReserved = await this.preorderRepo.hasUserReserved(userId, campaignId);
    
    let distance: number | undefined;
    // We calculate distance manually here since findCampaignById doesn't inject it automatically like getAvailableCampaigns does.
    if (latitude && longitude && (campaign as any).farmer?.latitude && (campaign as any).farmer?.longitude) {
      distance = this.calculateDistance(
        latitude,
        longitude,
        (campaign as any).farmer.latitude,
        (campaign as any).farmer.longitude
      );
    }

    const extraDetails = await this.preorderRepo.getCampaignExtraDetails(campaignId, userId, campaign.farmerId);

    return {
      id: campaign.id,
      productId: "", // Keeping empty if not directly linked to a marketplace product right now
      title: campaign.title,
      farmerName: (campaign as any).farmer?.name || "Unknown Farmer",
      productImage: (campaign.images && campaign.images.length > 0) ? campaign.images[0] : ((campaign as any).farmer?.coverImage || (campaign as any).farmer?.profileImage || ""),
      targetQuantity: campaign.targetQuantity,
      currentReservations: campaign.currentBookedQuantity,
      deadline: campaign.estimatedHarvestDate,
      estimatedHarvestDate: campaign.estimatedHarvestDate,
      depositRequired: campaign.depositPercentage > 0,
      depositAmount: campaign.depositPercentage, // Usually percentage, or maybe calculate exact amount based on some price. For now, we return the percentage.
      status: campaign.status,
      price: campaign.pricePerUnit,
      unit: campaign.unit,
      description: campaign.description || "",
      hasReserved,
      distance,
      location: (campaign as any).farmer?.city || "Unknown Location",
      minimumOrder: campaign.minimumOrderQuantity,
      userReservedQuantity: extraDetails.userReservedQuantity,
      successfulHarvests: extraDetails.successfulHarvests,
      totalPeopleReserved: extraDetails.totalPeopleReserved,
      communityReservations: extraDetails.communityReservations,
      profileImage: (campaign as any).farmer?.profileImage || (campaign as any).farmer?.coverImage || "",
      isScheduled: extraDetails.isScheduled,
    };
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
