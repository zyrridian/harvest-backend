import { IPreOrderRepository } from "../../domain/repositories/preorder.repository";

export class GetCampaignsUseCase {
  constructor(private readonly preorderRepo: IPreOrderRepository) {}

  async execute(latitude?: number, longitude?: number): Promise<any[]> {
    const campaigns = await this.preorderRepo.getAvailableCampaigns(latitude, longitude);

    return campaigns.map((campaign) => ({
      id: campaign.id,
      productId: "", // keeping empty as model might not have direct product link yet
      title: campaign.title,
      farmerName: campaign.farmer?.name || "Unknown Farmer",
      productImage: campaign.farmer?.coverImage || campaign.farmer?.profileImage || "",
      targetQuantity: campaign.targetQuantity,
      currentReservations: campaign.currentBookedQuantity,
      deadline: campaign.estimatedHarvestDate,
      estimatedHarvestDate: campaign.estimatedHarvestDate,
      price: campaign.pricePerUnit,
      unit: campaign.unit,
      distance: (campaign as any).distance, // injected by repository
    }));
  }
}
