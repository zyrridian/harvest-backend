import { IPreOrderRepository, CampaignWithFarmer, ReservationWithCampaign } from "../../domain/repositories/preorder.repository";
import prisma from "@/core/database/prisma";
import { PreorderCampaign, PreorderReservation } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";

export class PrismaPreOrderRepository implements IPreOrderRepository {

  // ============================================
  // CONSUMER SIDE
  // ============================================

  async getAvailableCampaigns(latitude?: number, longitude?: number, filter?: string, userId?: string): Promise<CampaignWithFarmer[]> {
    const isCategoryFilter = filter && !['near_you', 'near you', 'closing_soon', 'closing soon', 'all'].includes(filter.toLowerCase());

    let campaigns = await prisma.preorderCampaign.findMany({
      where: {
        ...(isCategoryFilter ? { category: { equals: filter, mode: 'insensitive' } } : {})
      },
      include: {
        farmer: true,
        _count: {
          select: {
            reservations: true
          }
        },
        ...(userId ? { schedules: { where: { userId } } } : {})
      }
    }) as any[];

    campaigns = campaigns.map(c => {
      c.isScheduled = c.schedules && c.schedules.length > 0;
      return c;
    });

    if (latitude && longitude) {
      campaigns = campaigns.map((c) => {
        if (c.farmer?.latitude && c.farmer?.longitude) {
          c.distance = this.calculateDistance(
            latitude,
            longitude,
            c.farmer.latitude,
            c.farmer.longitude
          );
        }
        return c;
      });
    }

    if (filter === 'near_you' || filter === 'near you') {
      campaigns.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    } else if (filter === 'closing_soon' || filter === 'closing soon') {
      campaigns.sort((a, b) => a.estimatedHarvestDate.getTime() - b.estimatedHarvestDate.getTime());
    } else {
      if (latitude && longitude) {
        campaigns.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
      } else {
        campaigns.sort((a, b) => a.estimatedHarvestDate.getTime() - b.estimatedHarvestDate.getTime());
      }
    }

    return campaigns;
  }

  async getUserReservations(userId: string): Promise<ReservationWithCampaign[]> {
    return prisma.preorderReservation.findMany({
      where: { userId },
      include: {
        campaign: {
          include: { farmer: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as unknown as ReservationWithCampaign[];
  }

  async createReservation(userId: string, campaignId: string, quantity: number, deliveryMethod: string, addressId?: string): Promise<PreorderReservation> {
    return await prisma.$transaction(async (tx) => {
      const campaign = await tx.preorderCampaign.findUnique({
        where: { id: campaignId }
      });

      const allowedStatuses = ["ACTIVE"];
      if (!campaign || !allowedStatuses.includes(campaign.status)) {
        throw AppError.badRequest("Campaign is not available for reservation");
      }

      if (quantity < campaign.minimumOrderQuantity) {
        throw AppError.badRequest(`Minimum preorder is ${campaign.minimumOrderQuantity} ${campaign.unit}`);
      }

      if (campaign.currentBookedQuantity + quantity > campaign.targetQuantity) {
        throw AppError.badRequest("Not enough target quantity remaining");
      }

      // Update booked quantity
      const newBooked = campaign.currentBookedQuantity + quantity;
      let newStatus = campaign.status;
      if (newBooked >= campaign.targetQuantity) {
        newStatus = "FULLY_BOOKED";
      }

      await tx.preorderCampaign.update({
        where: { id: campaignId },
        data: {
          currentBookedQuantity: newBooked,
          status: newStatus
        }
      });

      const totalPrice = campaign.pricePerUnit * quantity;

      // Create reservation
      return tx.preorderReservation.create({
        data: {
          campaignId,
          userId,
          quantity,
          totalPrice,
          status: "PENDING_PAYMENT",
          deliveryMethod,
          addressId
        }
      });
    });
  }

  async findCampaignById(campaignId: string): Promise<PreorderCampaign | null> {
    return prisma.preorderCampaign.findUnique({
      where: { id: campaignId },
      include: { farmer: true }
    });
  }

  async findReservationById(reservationId: string): Promise<PreorderReservation | null> {
    return prisma.preorderReservation.findUnique({
      where: { id: reservationId },
      include: { campaign: true }
    });
  }

  async cancelReservation(reservationId: string, reason?: string): Promise<PreorderReservation> {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.preorderReservation.findUnique({
        where: { id: reservationId }
      });

      if (!reservation) throw new Error("Reservation not found");
      if (reservation.status === "CANCELLED") return reservation;

      // Restore campaign booked quantity
      await tx.preorderCampaign.update({
        where: { id: reservation.campaignId },
        data: {
          currentBookedQuantity: {
            decrement: reservation.quantity
          },
          status: "ACTIVE" // If it was fully booked, it might be active again
        }
      });

      return tx.preorderReservation.update({
        where: { id: reservationId },
        data: {
          status: "CANCELLED"
        }
      });
    });
  }

  async updateReservationStatus(reservationId: string, status: string, paymentMethod?: string): Promise<PreorderReservation> {
    const data: any = { status };
    if (paymentMethod) data.paymentMethod = paymentMethod;

    return prisma.preorderReservation.update({
      where: { id: reservationId },
      data
    });
  }

  // ============================================
  // FARMER SIDE
  // ============================================

  async createCampaign(farmerId: string, data: Partial<PreorderCampaign>): Promise<PreorderCampaign> {
    return prisma.preorderCampaign.create({
      data: {
        ...data,
        farmerId,
        status: data.status || "DRAFT"
      } as any
    });
  }

  async updateCampaign(campaignId: string, data: Partial<PreorderCampaign>): Promise<PreorderCampaign> {
    return prisma.preorderCampaign.update({
      where: { id: campaignId },
      data: data as any
    });
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<PreorderCampaign> {
    return prisma.preorderCampaign.update({
      where: { id: campaignId },
      data: { status }
    });
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await prisma.preorderCampaign.delete({
      where: { id: campaignId }
    });
  }

  async getFarmerCampaigns(farmerId: string): Promise<PreorderCampaign[]> {
    const campaigns = await prisma.preorderCampaign.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  }

  async fulfillCampaign(campaignId: string): Promise<{ createdOrders: number }> {
    return prisma.$transaction(async (tx) => {
      const campaign = await tx.preorderCampaign.findUnique({
        where: { id: campaignId },
        include: {
          reservations: {
            where: { status: { in: ['PAID'] } }
          }
        }
      });

      if (!campaign) throw new Error("Campaign not found");

      // Update reservation statuses to COMPLETED
      if (campaign.reservations.length > 0) {
        const reservationIds = campaign.reservations.map(r => r.id);
        await tx.preorderReservation.updateMany({
          where: { id: { in: reservationIds } },
          data: { status: 'COMPLETED' }
        });
      }

      // Update campaign status to COMPLETED
      await tx.preorderCampaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED' }
      });

      return { createdOrders: 0 };
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

  async hasUserReserved(userId: string, campaignId: string): Promise<boolean> {
    const count = await prisma.preorderReservation.count({
      where: {
        userId,
        campaignId,
        status: {
          not: "CANCELLED"
        }
      }
    });
    return count > 0;
  }

  async getCampaignExtraDetails(campaignId: string, userId: string, farmerId: string): Promise<any> {
    const userReservedQuantityAggr = await prisma.preorderReservation.aggregate({
      where: { userId, campaignId, status: { not: "CANCELLED" } },
      _sum: { quantity: true }
    });
    const userReservedQuantity = userReservedQuantityAggr._sum.quantity || 0;

    const successfulHarvests = await prisma.preorderCampaign.count({
      where: { farmerId, status: "COMPLETED" }
    });

    const totalPeopleReservedGroup = await prisma.preorderReservation.groupBy({
      by: ['userId'],
      where: { campaignId, status: { not: "CANCELLED" } }
    });

    const recentReservations = await prisma.preorderReservation.findMany({
      where: { campaignId, status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    const userSchedule = await prisma.userCampaignSchedule.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId
        }
      }
    });

    return {
      userReservedQuantity,
      successfulHarvests,
      totalPeopleReserved: totalPeopleReservedGroup.length,
      communityReservations: recentReservations.map(r => ({
        id: r.user.id,
        name: r.user.name,
        profileImage: r.user.avatarUrl
      })),
      isScheduled: !!userSchedule
    };
  }

  async getFarmerCampaignDetail(campaignId: string, farmerId: string): Promise<any> {
    const campaign = await prisma.preorderCampaign.findUnique({
      where: { id: campaignId },
      include: {
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        farmer: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.farmerId !== farmerId) {
      throw new Error("Unauthorized: This campaign does not belong to you");
    }

    // Get all unique address ids from reservations
    const addressIds = campaign.reservations
      .map(r => r.addressId)
      .filter((id): id is string => !!id);

    const addresses = addressIds.length > 0
      ? await prisma.address.findMany({
          where: { id: { in: addressIds } }
        })
      : [];

    const addressMap = new Map(addresses.map(a => [a.id, a]));

    // Find existing conversations between the farmer (farmer.userId) and all unique buyer userIds
    const buyerIds = campaign.reservations.map(r => r.userId);
    const farmerUserId = campaign.farmer.userId;

    const conversations = buyerIds.length > 0
      ? await prisma.conversation.findMany({
          where: {
            OR: [
              { participant1Id: farmerUserId, participant2Id: { in: buyerIds } },
              { participant1Id: { in: buyerIds }, participant2Id: farmerUserId }
            ]
          },
          select: {
            id: true,
            participant1Id: true,
            participant2Id: true
          }
        })
      : [];

    // Map buyer userId to conversation ID
    const conversationMap = new Map<string, string>();
    for (const conv of conversations) {
      const buyerId = conv.participant1Id === farmerUserId ? conv.participant2Id : conv.participant1Id;
      conversationMap.set(buyerId, conv.id);
    }

    // Format reservations
    const formattedReservations = campaign.reservations.map(res => {
      const addr = res.addressId ? addressMap.get(res.addressId) : null;
      return {
        id: res.id,
        quantity: res.quantity,
        totalPrice: res.totalPrice,
        status: res.status,
        paymentMethod: res.paymentMethod,
        deliveryMethod: res.deliveryMethod,
        addressId: res.addressId,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
        // Address details
        fullAddress: addr ? addr.fullAddress : null,
        latitude: addr ? addr.latitude : null,
        longitude: addr ? addr.longitude : null,
        // Buyer details
        buyerId: res.user.id,
        buyerName: res.user.name,
        buyerAvatarUrl: res.user.avatarUrl,
        // Chat conversation id
        conversationId: conversationMap.get(res.userId) || null
      };
    });

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      unit: campaign.unit,
      pricePerUnit: campaign.pricePerUnit,
      minimumOrderQuantity: campaign.minimumOrderQuantity,
      targetQuantity: campaign.targetQuantity,
      currentBookedQuantity: campaign.currentBookedQuantity,
      estimatedHarvestDate: campaign.estimatedHarvestDate,
      status: campaign.status,
      images: campaign.images,
      isScheduled: campaign.isScheduled,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      totalPeopleReserved: formattedReservations.length,
      reservations: formattedReservations
    };
  }
}

export const preOrderRepository = new PrismaPreOrderRepository();
