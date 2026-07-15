import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-requests/{id}/cancel:
 *   patch:
 *     summary: Cancel a sourcing request (Buyers only)
 *     tags: [Sourcing Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sourcing Request ID
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *       400:
 *         description: Invalid state
 *       403:
 *         description: Forbidden (Not the buyer of this request)
 *       404:
 *         description: Request not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id: requestId } = await params;

    const sourcingRequest = await prisma.sourcingRequest.findUnique({
      where: { id: requestId },
    });

    if (!sourcingRequest) {
      return NextResponse.json(
        { status: "error", message: "Sourcing request not found" },
        { status: 404 }
      );
    }

    if (sourcingRequest.buyerId !== user.userId) {
      return NextResponse.json(
        { status: "error", message: "Only the buyer who created the request can cancel it" },
        { status: 403 }
      );
    }

    if (sourcingRequest.status !== "open") {
      return NextResponse.json(
        { status: "error", message: "This request is no longer open and cannot be cancelled" },
        { status: 400 }
      );
    }

    // Execute the cancellation logic in a transaction
    const [updatedRequest, _rejectedOffers] = await prisma.$transaction(
      async (tx) => {
        // 1. Mark the request as cancelled
        const req = await tx.sourcingRequest.update({
          where: { id: requestId },
          data: { status: "cancelled" },
        });

        // 2. Mark all pending offers as rejected
        const rejOffers = await tx.sourcingOffer.updateMany({
          where: {
            requestId: requestId,
            status: "pending",
          },
          data: { status: "rejected" },
        });

        return [req, rejOffers];
      }
    );

    return NextResponse.json({
      status: "success",
      message: "Request cancelled successfully",
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
      },
    });
  } catch (error: any) {
    console.error("Error cancelling request:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to cancel request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
