import { IHarvestScheduleRepository } from "../../domain/repositories/harvest-schedule.repository";
import { HarvestScheduleDashboardResponseDTO, HarvestScheduleItemDTO } from "../dtos/harvest-schedule.dto";

export class GetHarvestScheduleDashboardUseCase {
  constructor(private readonly harvestRepo: IHarvestScheduleRepository) {}

  async execute(userId: string, targetMonth: string, latitude?: number, longitude?: number): Promise<HarvestScheduleDashboardResponseDTO> {
    const [year, month] = targetMonth.split("-").map(Number);
    const dateObj = new Date(year, month - 1, 1);
    
    const campaigns = await this.harvestRepo.getUserScheduledCampaigns(userId, dateObj, latitude, longitude);

    const now = new Date();
    let thisWeekCount = 0;
    let readyTodayCount = 0;

    const items: HarvestScheduleItemDTO[] = campaigns.map(campaign => {
      const harvestDate = campaign.estimatedHarvestDate || new Date();
      
      const isToday = this.isSameDay(now, harvestDate);
      if (isToday) readyTodayCount++;
      
      if (this.isThisWeek(now, harvestDate)) {
        thisWeekCount++;
      }

      let statusText = "Upcoming";
      if (campaign.status === "COMPLETED") statusText = "Completed";
      else if (isToday) statusText = "Now";
      else if (harvestDate < now) statusText = "Ready";

      const badges = [];
      if (campaign.isReservedByMe) {
        badges.push("Reserved");
      } else {
        badges.push("Following");
      }
      
      if (isToday && campaign.status !== "COMPLETED") badges.push("Harvesting today");
      else if (harvestDate <= now && campaign.status !== "COMPLETED") badges.push("Harvested");
      
      const action1 = "View\\ndetails";
      const action2 = ""; // Removed pay deposit and arrange pickup

      const descText = campaign.description || `${campaign.farmer.name} harvest`;

      const dateGroup = isToday ? `TODAY — ${this.formatShortDate(harvestDate)}` : this.formatShortDate(harvestDate);

      return {
        id: campaign.id,
        title: campaign.title || "Unknown Campaign",
        farmer_name: campaign.farmer?.name || "Unknown Farmer",
        distance: campaign.distance || 0,
        image_url: campaign.images?.[0] || campaign.farmer?.profileImage || "",
        status_text: statusText,
        price: campaign.pricePerUnit || 0,
        badges,
        description_text: descText,
        action_button_1: action1,
        action_button_2: action2,
        date_group: dateGroup.toUpperCase(),
        is_today: isToday,
        date_day_filter: harvestDate.getDate().toString()
      };
    });

    return {
      this_week_count: thisWeekCount,
      ready_today_count: readyTodayCount,
      this_month_count: campaigns.length,
      items
    };
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private isThisWeek(now: Date, d: Date): boolean {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    return d >= startOfWeek && d <= endOfWeek;
  }

  private formatShortDate(d: Date): string {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
}
