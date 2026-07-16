import { IPreOrderRepository, CampaignWithFarmer, ReservationWithCampaign } from "../../domain/repositories/preorder.repository";
import prisma from "@/core/database/prisma";
import { PreorderCampaign, PreorderReservation } from "@/generated/prisma/client";

export class PrismaPreOrderRepository implements IPreOrderRepository {
  
  // ============================================
  // CONSUMER SIDE
  // ============================================

  async getAvailableCampaigns(latitude?: number, longitude?: number, filter?: string): Promise<CampaignWithFarmer[]> {
    const isCategoryFilter = filter && !['near_you', 'near you', 'closing_soon', 'closing soon', 'all'].includes(filter.toLowerCase());

    let campaigns = await prisma.preorderCampaign.findMany({
      where: {
        status: "ACTIVE",
        estimatedHarvestDate: {
          gt: new Date()
        },
        ...(isCategoryFilter ? { category: { equals: filter, mode: 'insensitive' } } : {})
      },
      include: {
        farmer: true,
        _count: {
          select: {
            reservations: true
          }
        }
      }
    }) as CampaignWithFarmer[];

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

      if (!campaign || campaign.status !== "ACTIVE") {
        throw new Error("Campaign is not available for reservation");
      }

      if (campaign.currentBookedQuantity + quantity > campaign.targetQuantity) {
        throw new Error("Not enough target quantity remaining");
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
      const depositAmount = (totalPrice * campaign.depositPercentage) / 100;

      // Create reservation
      return tx.preorderReservation.create({
        data: {
          campaignId,
          userId,
          quantity,
          totalPrice,
          depositAmount,
          status: depositAmount > 0 ? "PENDING_DEPOSIT" : "FULLY_PAID", // simple logic
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
      include: {
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    // Manually attach addresses to reservations
    for (const campaign of campaigns) {
      for (const res of campaign.reservations) {
        if (res.addressId) {
          const address = await prisma.address.findUnique({
            where: { id: res.addressId }
          });
          // Attach it dynamically (it will be serialized in JSON response)
          (res as any).address = address;
        }
      }
    }

    return campaigns;
  }

  async fulfillCampaign(campaignId: string): Promise<{ createdOrders: number }> {
    return prisma.$transaction(async (tx) => {
      const campaign = await tx.preorderCampaign.findUnique({
        where: { id: campaignId },
        include: {
          reservations: {
            where: { status: { in: ['FULLY_PAID', 'READY_FOR_PICKUP'] } }
          },
          farmer: {
            select: { userId: true }
          }
        }
      });

      if (!campaign) throw new Error("Campaign not found");
      if (campaign.reservations.length === 0) return { createdOrders: 0 };

      // Create a dummy product for order item constraints
      const dummyProduct = await tx.product.create({
        data: {
          name: `Preorder: ${campaign.title}`,
          description: campaign.description,
          sellerId: campaign.farmer.userId,
          price: campaign.pricePerUnit,
          unit: campaign.unit,
          isAvailable: false,
        }
      });

      let createdOrders = 0;
      for (const res of campaign.reservations) {
        const orderNumber = `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await tx.order.create({
          data: {
            orderNumber,
            buyerId: res.userId,
            sellerId: campaign.farmer.userId,
            status: 'processing',
            subtotal: res.totalPrice,
            totalAmount: res.totalPrice,
            isDeposit: true,
            depositAmount: res.depositAmount,
            deliveryMethod: res.deliveryMethod || 'harvest_schedule',
            deliveryAddressId: res.addressId,
            paymentMethod: res.paymentMethod,
            paymentStatus: 'paid',
            items: {
              create: {
                productId: dummyProduct.id,
                productName: dummyProduct.name,
                quantity: Math.max(1, Math.round(res.quantity)), // Prisma int requirement if quantity is Float
                unitPrice: dummyProduct.price,
                subtotal: res.totalPrice,
              }
            }
          }
        });
        
        await tx.preorderReservation.update({
          where: { id: res.id },
          data: { status: 'COMPLETED' }
        });
        createdOrders++;
      }
      
      await tx.preorderCampaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED' }
      });

      return { createdOrders };
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
}

export const preOrderRepository = new PrismaPreOrderRepository();
