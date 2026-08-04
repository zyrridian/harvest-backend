import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import prisma from "@/core/database/prisma";

/**
 * @swagger
 * /api/v1/preorders/campaigns/{id}/fulfill:
 *   post:
 *     summary: Fulfill a preorder campaign
 *     description: Converts all paid reservations in a campaign into standard Orders for logistics.
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
 *     responses:
 *       200:
 *         description: Campaign fulfilled successfully
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await verifyAuth(request);
    const { id: campaignId } = await context.params;

    // Verify ownership
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw new Error("User is not a registered farmer");

    const existingCampaign = await preOrderRepository.findCampaignById(campaignId);
    if (!existingCampaign) {
      throw new Error("Campaign not found");
    }

    if (existingCampaign.farmerId !== farmer.id) {
      throw new Error("Unauthorized to fulfill this campaign");
    }

    if (existingCampaign.status === "COMPLETED") {
      throw new Error("Campaign is already fulfilled");
    }

    const result = await preOrderRepository.fulfillCampaign(campaignId);

    return successResponse({
      message: "Successfully completed the preorder campaign. All paid reservations marked as completed.",
      ...result
    });
  } catch (error) {
    return handleRouteError(error, "FulfillPreorderCampaign");
  }
}
