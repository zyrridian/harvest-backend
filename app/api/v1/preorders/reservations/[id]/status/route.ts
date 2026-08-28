import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError, AppError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { parseBody } from "@/core/helpers/parseBody";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import { z } from "zod";

const UpdateStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "COMPLETED", "CANCELLED"]),
});

// Define valid forward transitions to prevent going backward
const VALID_TRANSITIONS: Record<string, string[]> = {
  "PENDING_PAYMENT": ["PAID", "CANCELLED"],
  "PAID": ["COMPLETED", "CANCELLED"],
  "COMPLETED": [],
  "CANCELLED": []
};

/**
 * @swagger
 * /api/v1/preorders/reservations/{id}/status:
 *   patch:
 *     summary: Update a reservation status
 *     description: Change the status of a reservation with validation to prevent backward transitions
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING_PAYMENT, PAID, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Reservation status updated successfully
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await verifyAuth(request);
    const resolvedParams = await context.params;
    
    const body = await parseBody(request);
    const { status: newStatus } = UpdateStatusSchema.parse(body);

    const reservation = await preOrderRepository.findReservationById(resolvedParams.id);
    
    if (!reservation) {
      throw AppError.notFound("Reservation not found");
    }

    const currentStatus = reservation.status;
    
    if (currentStatus === newStatus) {
      return successResponse(reservation, { message: "Status is already up to date" });
    }

    // Validate that this is a valid forward transition
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw AppError.badRequest(`Cannot transition reservation from ${currentStatus} to ${newStatus}`);
    }

    let updatedReservation;
    if (newStatus === "CANCELLED") {
      // Use the proper cancel method to ensure we release stock/booked quantity back to the campaign
      updatedReservation = await preOrderRepository.cancelReservation(reservation.id);
    } else {
      updatedReservation = await preOrderRepository.updateReservationStatus(reservation.id, newStatus);
    }

    return successResponse(updatedReservation, { message: `Reservation marked as ${newStatus}` });
  } catch (error) {
    return handleRouteError(error, "UpdateReservationStatus");
  }
}
