import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product added to cart
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

    const body = await request.json();
    const { product_id, quantity = 1, notes } = body;

    if (!product_id) {
      return NextResponse.json(
        { status: "error", message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: product_id },
      include: {
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
    });

    if (!product) {
      return NextResponse.json(
        { status: "error", message: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate prices
    const activeDiscount = product.discounts[0];
    const discountPrice = activeDiscount
      ? activeDiscount.type === "percentage"
        ? product.price * (1 - activeDiscount.value / 100)
        : product.price - activeDiscount.value
      : null;
    const subtotal = (discountPrice || product.price) * quantity;

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product_id,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const newSubtotal = (discountPrice || product.price) * newQuantity;

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          subtotal: newSubtotal,
          notes: notes || existingItem.notes,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product_id,
          quantity,
          unitPrice: product.price,
          discountPrice,
          subtotal,
          notes,
        },
      });
    }

    // Get cart summary
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const cartTotalItems = allItems.length;
    const cartGrandTotal = allItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return NextResponse.json(
      {
        status: "success",
        message: "Product added to cart",
        data: {
          cart_item_id: cartItem.id,
          product_id: cartItem.productId,
          quantity: cartItem.quantity,
          subtotal: cartItem.subtotal,
          cart_total_items: cartTotalItems,
          cart_grand_total: cartGrandTotal,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to add to cart",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
