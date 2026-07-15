import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-offers/{id}/accept:
 *   patch:
 *     summary: Accept a sourcing offer (Buyers only)
 *     tags: [Sourcing Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sourcing Offer ID
 *     responses:
 *       200:
 *         description: Offer accepted successfully, returns conversation details
 *       400:
 *         description: Invalid state
 *       403:
 *         description: Forbidden (Not the buyer of this request)
 *       404:
 *         description: Offer not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id: offerId } = await params;

    // Fetch the offer and the associated request
    const offer = await prisma.sourcingOffer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
        farmer: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { status: "error", message: "Offer not found" },
        { status: 404 }
      );
    }

    if (offer.request.buyerId !== user.userId) {
      return NextResponse.json(
        { status: "error", message: "Only the buyer who made the request can accept offers" },
        { status: 403 }
      );
    }

    if (offer.request.status !== "open") {
      return NextResponse.json(
        { status: "error", message: "This request is no longer open" },
        { status: 400 }
      );
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { status: "error", message: "This offer is no longer pending" },
        { status: 400 }
      );
    }

    // Execute the acceptance logic in a transaction
    const [acceptedOffer, updatedRequest, _rejectedOffers, conversation] = await prisma.$transaction(
      async (tx) => {
        // 1. Mark this offer as accepted
        const accOffer = await tx.sourcingOffer.update({
          where: { id: offerId },
          data: { status: "accepted" },
        });

        // 2. Mark the request as fulfilled
        const req = await tx.sourcingRequest.update({
          where: { id: offer.requestId },
          data: { status: "fulfilled" },
        });

        // 3. Mark all other offers for this request as rejected
        const rejOffers = await tx.sourcingOffer.updateMany({
          where: {
            requestId: offer.requestId,
            id: { not: offerId },
          },
          data: { status: "rejected" },
        });

        // 4. Create a chat conversation between the buyer and the farmer
        // Check if a conversation already exists
        let conv = await tx.conversation.findFirst({
          where: {
            participant1Id: user.userId,
            participant2Id: offer.farmer.userId, // Note: Conversation uses user IDs
          },
        });

        if (!conv) {
          // Fallback check reverse participants just in case
          conv = await tx.conversation.findFirst({
            where: {
              participant1Id: offer.farmer.userId,
              participant2Id: user.userId,
            },
          });
        }

        if (!conv) {
          conv = await tx.conversation.create({
            data: {
              type: "GENERAL",
              participant1Id: user.userId,
              participant2Id: offer.farmer.userId,
            },
          });
        }

        return [accOffer, req, rejOffers, conv];
      }
    );

    return NextResponse.json({
      status: "success",
      message: "Offer accepted successfully. You can now chat with the farmer.",
      data: {
        offer_id: acceptedOffer.id,
        request_id: updatedRequest.id,
        conversation_id: conversation.id,
      },
    });
  } catch (error: any) {
    console.error("Error accepting offer:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to accept offer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
