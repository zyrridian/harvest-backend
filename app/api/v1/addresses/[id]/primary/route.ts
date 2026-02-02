import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/addresses/{id}/primary:
 *   patch:
 *     summary: Set address as primary
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
 *         description: Primary address updated
 *       401:
 *         description: Unauthorized
 */
export async function PATCH(
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

    // Get address
    const address = await prisma.address.findUnique({
      where: { id },
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

    // Unset all primary addresses for this user
    await prisma.address.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this address as primary
    const updated = await prisma.address.update({
      where: { id },
      data: { isPrimary: true },
    });

    return NextResponse.json({
      status: "success",
      message: "Primary address updated",
      data: {
        address_id: updated.id,
        is_primary: updated.isPrimary,
      },
    });
  } catch (error: any) {
    console.error("Error setting primary address:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to set primary address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
