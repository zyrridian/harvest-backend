import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/cart/items/{id}/select:
 *   patch:
 *     summary: Toggle cart item selection for checkout
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
 *               is_selected:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item selection updated
 *       401:
 *         description: Unauthorized
 */
export async function PATCH(
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
    const { is_selected } = body;

    if (is_selected === undefined) {
      return NextResponse.json(
        { status: "error", message: "is_selected is required" },
        { status: 400 }
      );
    }

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

    // Update selection
    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: { isSelected: is_selected },
    });

    // Calculate selected items total
    const selectedItems = await prisma.cartItem.findMany({
      where: {
        cartId: cartItem.cartId,
        isSelected: true,
      },
    });

    const selectedItemsTotal = selectedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    return NextResponse.json({
      status: "success",
      message: "Item selection updated",
      data: {
        cart_item_id: updated.id,
        is_selected: updated.isSelected,
        selected_items_total: selectedItemsTotal,
      },
    });
  } catch (error: any) {
    console.error("Error updating cart item selection:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update selection",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
