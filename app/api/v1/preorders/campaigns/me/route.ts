import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import prisma from "@/core/database/prisma";

/**
 * @swagger
 * /api/v1/preorders/campaigns/me:
 *   get:
 *     summary: Get farmer's own campaigns
 *     description: Fetch all preorder campaigns created by the authenticated farmer
 *     tags:
 *       - Preorders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer's campaigns retrieved
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) {
      throw new Error("User is not a registered farmer");
    }

    const campaigns = await preOrderRepository.getFarmerCampaigns(farmer.id);

    return successResponse(campaigns);
  } catch (error) {
    return handleRouteError(error, "GetFarmerCampaigns");
  }
}
