import { IPreOrderRepository } from "../../domain/repositories/preorder.repository";
import { ActiveReservationDTO } from "../dtos/preorder.dto";

export class GetUserReservationsUseCase {
  constructor(private readonly preorderRepo: IPreOrderRepository) {}

  async execute(userId: string): Promise<ActiveReservationDTO[]> {
    const reservationsData = await this.preorderRepo.getUserReservations(userId);

    const active_reservations: ActiveReservationDTO[] = reservationsData.map(r => {
      const c = r.campaign;
      const daysToHarvest = c?.estimatedHarvestDate ? Math.ceil((c.estimatedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      
      let statusStr = "Pending";
      if (r.status === "DEPOSIT_PAID") statusStr = "Confirmed";
      else if (r.status === "FULLY_PAID") statusStr = "Processing";

      return {
        id: r.id,
        campaign_id: r.campaignId,
        product_id: "", // Empty for now as there's no direct product mapping in PreorderCampaign yet
        title: c?.title || "Unknown Campaign",
        quantity_str: `${r.quantity || 0} ${c?.unit || ""}`,
        farmer_name: c?.farmer?.name || "Unknown Farmer",
        days_to_harvest: daysToHarvest > 0 ? daysToHarvest : 0,
        image_url: c?.farmer?.coverImage || c?.farmer?.profileImage || "",
        status: statusStr
      };
    });

    return active_reservations;
  }
}
