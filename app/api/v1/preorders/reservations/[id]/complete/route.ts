import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import prisma from "@/core/database/prisma";

/**
 * @swagger
 * /api/v1/preorders/reservations/{id}/complete:
 *   patch:
 *     summary: Mark a reservation as completed
 *     description: Farmer marks a reservation as delivered or picked up
 *     tags:
 *       - Preorders
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
 *         description: Reservation marked as completed
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyAuth(request);
    const resolvedParams = await context.params;

    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) {
      throw new Error("User is not a registered farmer");
    }

    // Verify ownership indirectly by checking if campaign belongs to this farmer
    const existing = await prisma.preorderReservation.findUnique({
      where: { id: resolvedParams.id },
      include: { campaign: true }
    });
    
    if (!existing || existing.campaign.farmerId !== farmer.id) {
      throw new Error("Reservation not found or unauthorized");
    }

    // Update reservation status directly
    const reservation = await prisma.preorderReservation.update({
      where: { id: resolvedParams.id },
      data: { status: "COMPLETED" },
    });

    return successResponse(reservation, { message: "Reservation marked as completed" });
  } catch (error) {
    return handleRouteError(error, "CompleteReservation");
  }
}
