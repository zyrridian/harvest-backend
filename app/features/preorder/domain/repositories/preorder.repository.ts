import { PreorderCampaign, PreorderReservation, Farmer } from "@/generated/prisma/client";

export type CampaignWithFarmer = PreorderCampaign & {
  farmer: Farmer;
  _count?: {
    reservations: number;
  };
  distance?: number;
  isScheduled?: boolean;
};

export type ReservationWithCampaign = PreorderReservation & {
  campaign: CampaignWithFarmer;
};

export interface IPreOrderRepository {
  // Consumer Side
  getAvailableCampaigns(latitude?: number, longitude?: number, filter?: string, userId?: string): Promise<CampaignWithFarmer[]>;
  getUserReservations(userId: string): Promise<ReservationWithCampaign[]>;
  createReservation(userId: string, campaignId: string, quantity: number, deliveryMethod: string, addressId?: string): Promise<PreorderReservation>;
  findCampaignById(campaignId: string): Promise<PreorderCampaign | null>;
  findReservationById(reservationId: string): Promise<PreorderReservation | null>;
  cancelReservation(reservationId: string, reason?: string): Promise<PreorderReservation>;
  updateReservationStatus(reservationId: string, status: string, paymentMethod?: string): Promise<PreorderReservation>;

  // Farmer Side
  createCampaign(farmerId: string, data: Partial<PreorderCampaign>): Promise<PreorderCampaign>;
  updateCampaign(campaignId: string, data: Partial<PreorderCampaign>): Promise<PreorderCampaign>;
  updateCampaignStatus(campaignId: string, status: string): Promise<PreorderCampaign>;
  deleteCampaign(campaignId: string): Promise<void>;
  getFarmerCampaigns(farmerId: string): Promise<PreorderCampaign[]>;
  getFarmerCampaignDetail(campaignId: string, farmerId: string): Promise<any>;
  fulfillCampaign(campaignId: string): Promise<{ createdOrders: number }>;

  hasUserReserved(userId: string, campaignId: string): Promise<boolean>;
  getCampaignExtraDetails(campaignId: string, userId: string, farmerId: string): Promise<any>;
}
