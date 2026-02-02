import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update existing address
 *     tags: [Addresses]
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
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               full_address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        // Await params in Next.js 15+
    const { id } = await params;

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
    const { label, recipient_name, phone, full_address, notes } = body;

    // Get address
    const address = await prisma.address.findUnique({
      where: { id: id },
    });

    if (!address) {
      return NextResponse.json(
        { status: "error", message: "Address not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (address.userId !== userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update address
    const updated = await prisma.address.update({
      where: { id: id },
      data: {
        ...(label && { label }),
        ...(recipient_name && { recipientName: recipient_name }),
        ...(phone && { phone }),
        ...(full_address && { fullAddress: full_address }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Address updated successfully",
      data: {
        address_id: updated.id,
        label: updated.label,
        updated_at: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Get address
    const address = await prisma.address.findUnique({
      where: { id: id },
    });

    if (!address) {
      return NextResponse.json(
        { status: "error", message: "Address not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (address.userId !== userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete address
    await prisma.address.delete({
      where: { id: id },
    });

    return NextResponse.json({
      status: "success",
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
