import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// Helper function to generate order number
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `FM${year}${month}${day}${random}`;
}

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get user's orders list
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [buyer, seller]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of orders
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
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 },
      );
    }
    const userId = payload.userId as string;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "buyer";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any =
      role === "seller" ? { sellerId: userId } : { buyerId: userId };
    if (status) {
      where.status = status;
    }

    // Get orders
    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      order_id: order.id,
      order_number: order.orderNumber,
      status: order.status,
      seller: {
        user_id: order.seller.id,
        name: order.seller.name,
        profile_picture: order.seller.avatarUrl,
      },
      items: order.items.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit: item.product.unit,
        image: item.productImage,
      })),
      item_count: order.items.length,
      total_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: order.totalAmount,
      currency: "IDR",
      delivery: {
        method: order.deliveryMethod,
        date: order.deliveryDate,
        tracking_number: order.trackingNumber,
      },
      created_at: order.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      status: "success",
      data: {
        orders: formattedOrders,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalItems,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order from cart items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart_item_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               delivery_address_id:
 *                 type: string
 *               delivery_method:
 *                 type: string
 *               delivery_date:
 *                 type: string
 *               delivery_time_slot:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 },
      );
    }
    const userId = payload.userId as string;

    const body = await request.json();
    const {
      cart_item_ids,
      delivery_address_id,
      delivery_method = "home_delivery",
      delivery_date,
      delivery_time_slot = "morning",
      payment_method = "bank_transfer",
      notes,
    } = body;

    if (!cart_item_ids || cart_item_ids.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No cart items selected" },
        { status: 400 },
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        id: { in: cart_item_ids },
        cart: { userId },
      },
      include: {
        product: {
          include: {
            seller: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No valid cart items found" },
        { status: 404 },
      );
    }

    // Group items by seller
    const itemsBySeller: { [key: string]: typeof cartItems } = {};
    cartItems.forEach((item) => {
      const sellerId = item.product.sellerId;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(item);
    });

    // Create orders for each seller
    const createdOrders = [];
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFee = 15000; // Fixed for now
      const serviceFee = 2000;
      const totalDiscount = items.reduce(
        (sum, item) =>
          sum +
          (item.unitPrice - (item.discountPrice || item.unitPrice)) *
            item.quantity,
        0,
      );
      const totalAmount = subtotal + deliveryFee + serviceFee;

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: userId,
          sellerId,
          status: "pending_payment",
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
              discount:
                (item.unitPrice - (item.discountPrice || item.unitPrice)) *
                item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      createdOrders.push({
        order_id: order.id,
        order_number: order.orderNumber,
        status: order.status,
        total_amount: order.totalAmount,
      });

      // Remove items from cart
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: items.map((item) => item.id) },
        },
      });
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Order created successfully",
        data: {
          orders: createdOrders,
          payment_summary: {
            total_orders: createdOrders.length,
            grand_total: createdOrders.reduce(
              (sum, order) => sum + order.total_amount,
              0,
            ),
            payment_method,
            payment_instructions: {
              bank_name: "Bank Mandiri",
              account_number: "1234567890",
              account_name: "Farm Market",
              amount: createdOrders.reduce(
                (sum, order) => sum + order.total_amount,
                0,
              ),
              valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
          },
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
