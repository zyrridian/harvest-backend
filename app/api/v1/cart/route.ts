import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shopping cart details
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }
    const userId = payload.userId as string;

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                discounts: {
                  where: {
                    isActive: true,
                    validFrom: { lte: new Date() },
                    validUntil: { gte: new Date() },
                  },
                  take: 1,
                  orderBy: { value: "desc" },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                    },
                  },
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                  discounts: {
                    where: {
                      isActive: true,
                      validFrom: { lte: new Date() },
                      validUntil: { gte: new Date() },
                    },
                    take: 1,
                    orderBy: { value: "desc" },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Format cart items
    const formattedItems = cart.items.map((item) => {
      const primaryImage = item.product.images[0];
      const activeDiscount = item.product.discounts[0];
      const discountPrice = activeDiscount
        ? activeDiscount.type === "percentage"
          ? item.product.price * (1 - activeDiscount.value / 100)
          : item.product.price - activeDiscount.value
        : null;

      return {
        cart_item_id: item.id,
        product: {
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          discount: activeDiscount
            ? {
                discounted_price: discountPrice,
                value: activeDiscount.value,
                valid_until: activeDiscount.validUntil,
              }
            : null,
          image: primaryImage?.url || null,
          unit: item.product.unit,
          stock_quantity: item.product.stockQuantity,
          minimum_order: item.product.minimumOrder,
          maximum_order: item.product.maximumOrder,
          seller: {
            user_id: item.product.seller.id,
            name: item.product.seller.name,
            location: { city: null }, // TODO: Get from farmer profile
          },
          availability: {
            status:
              item.product.isAvailable && item.product.stockQuantity > 0
                ? "in_stock"
                : "out_of_stock",
          },
        },
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_price: item.discountPrice,
        subtotal: item.subtotal,
        notes: item.notes,
        is_selected: item.isSelected,
        is_available: item.isAvailable && item.product.isAvailable,
        added_at: item.addedAt,
        updated_at: item.updatedAt,
      };
    });

    // Group items by seller
    const groupedBySeller: any = {};
    formattedItems.forEach((item) => {
      const sellerId = item.product.seller.user_id;
      if (!groupedBySeller[sellerId]) {
        groupedBySeller[sellerId] = {
          seller: item.product.seller,
          items: [],
          subtotal: 0,
          delivery_fee: 15000, // Fixed for now, TODO: calculate based on location
          free_delivery_threshold: 100000,
        };
      }
      groupedBySeller[sellerId].items.push(item);
      if (item.is_selected) {
        groupedBySeller[sellerId].subtotal += item.subtotal;
      }
    });

    const groupedArray = Object.values(groupedBySeller).map((group: any) => ({
      ...group,
      is_eligible_free_delivery:
        group.subtotal >= group.free_delivery_threshold,
      amount_for_free_delivery: Math.max(
        0,
        group.free_delivery_threshold - group.subtotal
      ),
      total:
        group.subtotal +
        (group.subtotal >= group.free_delivery_threshold
          ? 0
          : group.delivery_fee),
    }));

    // Calculate summary
    const selectedItems = formattedItems.filter((item) => item.is_selected);
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalDiscount = selectedItems.reduce(
      (sum, item) =>
        sum +
        (item.unit_price - (item.discount_price || item.unit_price)) *
          item.quantity,
      0
    );
    const totalDeliveryFee = groupedArray.reduce(
      (sum, group) =>
        sum + (group.is_eligible_free_delivery ? 0 : group.delivery_fee),
      0
    );
    const serviceFee = 2000; // Fixed service fee
    const grandTotal = subtotal + totalDeliveryFee + serviceFee;

    return NextResponse.json({
      status: "success",
      data: {
        cart_id: cart.id,
        items: formattedItems,
        grouped_by_seller: groupedArray,
        summary: {
          total_items: formattedItems.length,
          total_quantity: formattedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          subtotal,
          total_discount: totalDiscount,
          total_delivery_fee: totalDeliveryFee,
          service_fee: serviceFee,
          grand_total: grandTotal,
        },
        unavailable_items: formattedItems.filter((item) => !item.is_available),
        recommendations: [], // TODO: Add product recommendations
        updated_at: cart.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }
    const userId = payload.userId as string;

    // Delete all cart items (cart will remain)
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId,
        },
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to clear cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
