import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyToken, extractBearerToken } from "@/features/auth";
import { logger } from "@/core/logger";

/**
 * @swagger
 * /api/v1/storefront/home:
 *   get:
 *     summary: Get personalized home page data
 *     description: Returns the user's active order, updates from their farmers, and weekly staples
 *     tags:
 *       - Storefront
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home data retrieved successfully
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== "access") {
      return NextResponse.json(
        { success: false, message: "Invalid token", data: null },
        { status: 401 },
      );
    }

    const userId = payload.userId;

    // 1. Fetch active order
    const activeOrderRecord = await prisma.order.findFirst({
      where: {
        buyerId: userId,
        status: { in: ["paid", "processing", "shipped", "out_for_delivery"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
          select: { productName: true },
        },
        seller: {
          select: {
            farmer: {
              select: { name: true },
            },
            name: true,
          },
        },
      },
    });

    let activeOrder = null;
    if (activeOrderRecord) {
      // Map status to a user-friendly label
      let statusLabel = activeOrderRecord.status;
      switch (activeOrderRecord.status) {
        case "paid":
        case "processing":
          statusLabel = "Preparing your order";
          break;
        case "shipped":
        case "out_for_delivery":
          statusLabel = "Arriving Today";
          break;
      }

      activeOrder = {
        id: activeOrderRecord.id,
        status: statusLabel,
        product_name: activeOrderRecord.items[0]?.productName || "Your order",
        farmer_name:
          activeOrderRecord.seller.farmer?.name ||
          activeOrderRecord.seller.name,
      };
    }

    // 2. Fetch updates from farmers the user has ordered from
    // First, find unique farmers
    const previousOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      select: { sellerId: true },
      distinct: ["sellerId"],
    });

    const farmerIds = previousOrders.map((o) => o.sellerId);

    // Fetch updates
    const communityPosts = await prisma.communityPost.findMany({
      where: {
        userId: { in: farmerIds },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        farmer: {
          select: { name: true, profileImage: true },
        },
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    const farmerUpdates = communityPosts.map((post) => {
      const farmerName = post.farmer?.name || post.user.name;
      const farmerAvatar =
        post.farmer?.profileImage ||
        post.user.avatarUrl ||
        "https://example.com/avatar.jpg";
      return {
        id: post.id,
        farmer_name: farmerName,
        farmer_avatar: farmerAvatar,
        content: post.content,
        time_ago: formatTimeAgo(post.createdAt),
      };
    });

    // 3. Fetch weekly staples (most frequent products bought by user)
    // Group by productId
    const frequentItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { buyerId: userId },
      },
      _count: { productId: true },
      orderBy: {
        _count: { productId: "desc" },
      },
      take: 4,
    });

    let weeklyStaples: any[] = [];
    if (frequentItems.length > 0) {
      const productIds = frequentItems.map((f) => f.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      });

      // Maintain sorted order based on frequency
      weeklyStaples = frequentItems
        .map((freq) => {
          const p = products.find((prod) => prod.id === freq.productId);
          if (!p) return null;

          return {
            id: p.id,
            name: p.name,
            quantity_label: `1 ${p.unit}`, // A placeholder label
            price: p.price,
            currency: p.currency,
            image: p.images[0]?.url || "https://example.com/placeholder.jpg",
          };
        })
        .filter(Boolean);
    }

    return NextResponse.json({
      success: true,
      message: "Home data retrieved successfully",
      data: {
        active_order: activeOrder,
        farmer_updates: farmerUpdates,
        weekly_staples: weeklyStaples,
      },
    });
  } catch (error) {
    logger.error("Home API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
        data: null,
      },
      { status: 500 },
    );
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
