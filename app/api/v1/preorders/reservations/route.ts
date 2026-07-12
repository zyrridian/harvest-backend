import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import { GetUserReservationsUseCase } from "@/features/preorder/application/usecases/get-user-reservations.usecase";

/**
 * @swagger
 * /api/v1/preorders/reservations:
 *   get:
 *     summary: Get user preorder reservations
 *     description: Fetches the list of reservations made by the currently authenticated user
 *     tags:
 *       - Preorders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User reservations retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Reservation ID
 *                       campaign_id:
 *                         type: string
 *                         description: Preorder Campaign ID
 *                       product_id:
 *                         type: string
 *                         description: Associated Product ID
 *                       title:
 *                         type: string
 *                       farmer_name:
 *                         type: string
 *                       quantity_str:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                       status:
 *                         type: string
 *                       days_to_harvest:
 *                         type: number
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    
    const useCase = new GetUserReservationsUseCase(preOrderRepository);
    const reservations = await useCase.execute(payload.userId);

    return successResponse(reservations);
  } catch (error) {
    return handleRouteError(error, "GetUserReservations");
  }
}

