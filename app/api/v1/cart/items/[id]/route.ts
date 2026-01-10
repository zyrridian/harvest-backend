import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/cart/items/{id}:
 *   put:
 *     summary: Update cart item quantity or notes
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart item updated
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { quantity, notes } = body;

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        cart: true,
        product: {
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
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { status: "error", message: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Calculate new subtotal if quantity changed
    let newSubtotal = cartItem.subtotal;
    if (quantity !== undefined) {
      const activeDiscount = cartItem.product.discounts[0];
      const price = activeDiscount
        ? activeDiscount.type === "percentage"
          ? cartItem.product.price * (1 - activeDiscount.value / 100)
          : cartItem.product.price - activeDiscount.value
        : cartItem.product.price;
      newSubtotal = price * quantity;
    }

    // Update cart item
    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: {
        ...(quantity !== undefined && { quantity, subtotal: newSubtotal }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Get cart totals
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });
    const cartGrandTotal = allItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return NextResponse.json({
      status: "success",
      message: "Cart item updated",
      data: {
        cart_item_id: updated.id,
        quantity: updated.quantity,
        subtotal: updated.subtotal,
        cart_grand_total: cartGrandTotal,
      },
    });
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update cart item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/cart/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { status: "error", message: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    // Get remaining cart items
    const remainingItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    const cartTotalItems = remainingItems.length;
    const cartGrandTotal = remainingItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return NextResponse.json({
      status: "success",
      message: "Item removed from cart",
      data: {
        cart_total_items: cartTotalItems,
        cart_grand_total: cartGrandTotal,
      },
    });
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to remove cart item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
