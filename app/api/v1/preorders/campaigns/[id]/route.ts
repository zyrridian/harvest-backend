import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import { GetCampaignDetailUseCase } from "@/features/preorder/application/usecases/get-campaign-detail.usecase";

/**
 * @swagger
 * /api/v1/preorders/campaigns/{id}:
 *   get:
 *     summary: Get preorder campaign details
 *     description: Fetch the full details of a specific preorder campaign, including whether the current user has a reservation.
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
 *         description: Campaign ID
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Campaign details retrieved successfully
 *       404:
 *         description: Campaign not found
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await verifyAuth(request);
    
    // Await params for Next.js 15+
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude") ? parseFloat(searchParams.get("latitude") as string) : undefined;
    const longitude = searchParams.get("longitude") ? parseFloat(searchParams.get("longitude") as string) : undefined;

    const useCase = new GetCampaignDetailUseCase(preOrderRepository);
    const campaignDetail = await useCase.execute(id, payload.userId, latitude, longitude);

    return successResponse(campaignDetail);
  } catch (error) {
    return handleRouteError(error, "GetCampaignDetail");
  }
}
