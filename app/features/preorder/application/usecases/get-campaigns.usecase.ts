import { IPreOrderRepository } from "../../domain/repositories/preorder.repository";

export class GetCampaignsUseCase {
  constructor(private readonly preorderRepo: IPreOrderRepository) {}

  async execute(latitude?: number, longitude?: number, filter?: string, userId?: string): Promise<any[]> {
    const campaigns = await this.preorderRepo.getAvailableCampaigns(latitude, longitude, filter, userId);

    return campaigns.map((campaign) => ({
      id: campaign.id,
      productId: "", // keeping empty as model might not have direct product link yet
      title: campaign.title,
      farmerName: campaign.farmer?.name || "Unknown Farmer",
      productImage: (campaign.images && campaign.images.length > 0) ? campaign.images[0] : (campaign.farmer?.coverImage || campaign.farmer?.profileImage || ""),
      targetQuantity: campaign.targetQuantity,
      currentReservations: campaign.currentBookedQuantity,
      totalPeopleReserved: campaign._count?.reservations || 0,
      deadline: campaign.estimatedHarvestDate,
      estimatedHarvestDate: campaign.estimatedHarvestDate,
      price: campaign.pricePerUnit,
      unit: campaign.unit,
      distance: campaign.distance ?? null, // injected by repository, default to null if not calculated
      profileImage: campaign.farmer?.profileImage || campaign.farmer?.coverImage || "",
      isScheduled: campaign?.isScheduled,
    }));
  }
}
