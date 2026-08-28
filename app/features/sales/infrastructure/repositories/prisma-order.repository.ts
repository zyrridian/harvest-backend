import prisma from "@/core/database/prisma";
import { IOrderRepository } from "../../domain/repositories/order.repository";
import { BUSINESS } from "@/core/config/constants";
import { AppError } from "@/core/errors";

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `FM${year}${month}${day}${random}`;
}

export class PrismaOrderRepository implements IOrderRepository {
  async findOrders(where: Record<string, unknown>, skip: number, limit: number): Promise<any[]> {
    return prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, farmer: { select: { profileImage: true } } },
        },
        items: {
          take: 3,
          include: {
            product: {
              select: { name: true, unit: true },
            },
          },
        },
      },
    });
  }

  async countOrders(where: Record<string, unknown>): Promise<number> {
    return prisma.order.count({ where });
  }

  async findOrderById(id: string): Promise<any> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            farmer: { select: { profileImage: true } },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        },
        deliveryAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });
  }

  async findOrderWithTracking(id: string, buyerId: string): Promise<any> {
    return prisma.order.findFirst({
      where: { id, buyerId },
      include: {
        routeStop: {
          include: {
            route: {
              select: {
                id: true,
                status: true,
                trackingEnabled: true,
                currentLat: true,
                currentLng: true,
                locationUpdatedAt: true,
                estimatedMinutes: true,
                totalDistanceKm: true,
              },
            },
          },
        },
        deliveryAddress: {
          select: { latitude: true, longitude: true, fullAddress: true },
        },
      },
    });
  }

  async updateOrder(id: string, data: any): Promise<any> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  async getUser(userId: string): Promise<any> {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async getCartItemsForOrder(userId: string, cartItemIds: string[]): Promise<any[]> {
    return prisma.cartItem.findMany({
      where: {
        id: { in: cartItemIds },
        cart: { userId },
      },
      include: {
        product: {
          include: {
            seller: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  async createOrdersInTransaction(
    userId: string,
    itemsBySeller: Record<string, any[]>,
    payload: any,
    orderLimit: number
  ): Promise<any[]> {
    const {
      delivery_address_id,
      delivery_method,
      clientDeliveryFee,
      delivery_date,
      delivery_time_slot,
      payment_method,
      notes,
    } = payload;

    return prisma.$transaction(async (tx) => {
      const orders = [];

      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        const farmer = await tx.farmer.findUnique({
          where: { userId: sellerId },
        });



        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        let deliveryFee: number;
        if (clientDeliveryFee !== null) {
          deliveryFee = clientDeliveryFee;
        } else if (delivery_method === "self_pickup") {
          deliveryFee = 0;
        } else {
          deliveryFee = BUSINESS.DELIVERY_FEE;
        }
        
        const serviceFee = BUSINESS.SERVICE_FEE;
        const totalDiscount = items.reduce(
          (sum, item) => sum + (item.unitPrice - (item.discountPrice || item.unitPrice)) * item.quantity,
          0
        );
        const totalAmount = subtotal + deliveryFee + serviceFee;

        const hasHarvestItems = false; // Harvest items are now handled via PreorderCampaigns

        const isCOD = payment_method === "cod";
        const orderStatus = isCOD ? "confirmed" : "pending_payment";

        const order = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            buyerId: userId,
            sellerId,
            status: orderStatus,
            subtotal,
            deliveryFee,
            serviceFee,
            totalDiscount,
            totalAmount,
            paymentMethod: payment_method,
            paymentStatus: "pending",
            deliveryMethod: delivery_method,
            deliveryAddressId: delivery_address_id,
            deliveryDate: delivery_date ? new Date(delivery_date) : null,
            deliveryTimeSlot: delivery_time_slot,
            notes,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.images?.[0]?.url || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: (item.unitPrice - (item.discountPrice || item.unitPrice)) * item.quantity,
                subtotal: item.subtotal,
              })),
            },
          },
          include: { items: true },
        });

        orders.push({
          order_id: order.id,
          order_number: order.orderNumber,
          status: order.status,
          total_amount: order.totalAmount,
        });

        await tx.cartItem.deleteMany({
          where: { id: { in: items.map((item) => item.id) } },
        });

        // Update product stock
        for (const item of items) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          
          if (updatedProduct.stockQuantity <= 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { isAvailable: false },
            });
          }
        }

        // Harvest items logic removed
      }

      return orders;
    });
  }

  async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber },
    });
  }

  async updatePaymentInfo(orderId: string, snapToken: string, paymentUrl: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { snapToken, paymentUrl },
    });
  }

  async getStopAheadCount(routeId: string, stopOrder: number): Promise<number> {
    const allStops = await prisma.routeStop.findMany({
      where: {
        routeId: routeId,
        stopOrder: { lt: stopOrder },
        status: { not: "completed" },
      },
    });
    return allStops.length;
  }
}

export const orderRepository = new PrismaOrderRepository();
