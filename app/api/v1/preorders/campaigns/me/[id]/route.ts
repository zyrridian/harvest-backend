import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import prisma from "@/core/database/prisma";

/**
 * @swagger
 * /api/v1/preorders/campaigns/me/{id}:
 *   get:
 *     summary: Get detailed preorder campaign for farmer
 *     description: Fetch detailed information about a specific campaign owned by the authenticated farmer, including reservation list, buyer details, address details, and chat conversation IDs.
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
 *         description: Campaign details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a registered farmer or does not own this campaign
 *       404:
 *         description: Campaign not found
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    
    // Await params for Next.js 15+
    const { id } = await context.params;

    const farmer = await prisma.farmer.findUnique({
      where: { userId: payload.userId }
    });

    if (!farmer) {
      return NextResponse.json(
        { status: "error", message: "User is not a registered farmer" },
        { status: 403 }
      );
    }

    const campaignDetail = await preOrderRepository.getFarmerCampaignDetail(id, farmer.id);

    return successResponse(campaignDetail);
  } catch (error: any) {
    if (error.message === "Campaign not found") {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 404 }
      );
    }
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 403 }
      );
    }
    return handleRouteError(error, "GetFarmerCampaignDetail");
  }
}
