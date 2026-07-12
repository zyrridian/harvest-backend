import { NextRequest } from "next/server";
import { GetCampaignsUseCase } from "@/features/preorder/application/usecases/get-campaigns.usecase";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { parseBody } from "@/core/helpers/parseBody";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import prisma from "@/core/database/prisma";

/**
 * @swagger
 * /api/v1/preorders/campaigns:
 *   post:
 *     summary: Create a preorder campaign
 *     description: Farmers can create a new preorder campaign
 *     tags:
 *       - Preorders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - unit
 *               - pricePerUnit
 *               - targetQuantity
 *               - estimatedHarvestDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               unit:
 *                 type: string
 *               pricePerUnit:
 *                 type: number
 *               minimumOrderQuantity:
 *                 type: number
 *                 default: 1
 *               targetQuantity:
 *                 type: number
 *               depositPercentage:
 *                 type: number
 *                 default: 0
 *               estimatedHarvestDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *             example:
 *               title: "Fresh Organic Tomatoes"
 *               description: "Sweet and juicy tomatoes from our next harvest."
 *               unit: "kg"
 *               pricePerUnit: 25000
 *               targetQuantity: 100
 *               estimatedHarvestDate: "2026-08-15T00:00:00Z"
 *               minimumOrderQuantity: 1
 *               depositPercentage: 50
 *               status: "ACTIVE"
 *     responses:
 *       200:
 *         description: Campaign created successfully
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    const body = await parseBody<any>(request);

    // Simplistic validation for now
    if (!body.title || !body.unit || !body.pricePerUnit || !body.targetQuantity || !body.estimatedHarvestDate) {
      throw new Error("Missing required fields for campaign");
    }

    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) {
      throw new Error("User is not a registered farmer");
    }

    const campaign = await preOrderRepository.createCampaign(farmer.id, {
      title: body.title,
      description: body.description,
      unit: body.unit,
      pricePerUnit: Number(body.pricePerUnit),
      minimumOrderQuantity: Number(body.minimumOrderQuantity || 1),
      targetQuantity: Number(body.targetQuantity),
      depositPercentage: Number(body.depositPercentage || 0),
      estimatedHarvestDate: new Date(body.estimatedHarvestDate),
      status: body.status || "ACTIVE"
    });

    return successResponse(campaign);
  } catch (error) {
    return handleRouteError(error, "CreatePreorderCampaign");
  }
}

/**
 * @swagger
 * /api/v1/preorders/campaigns:
 *   get:
 *     summary: List active preorder campaigns
 *     description: Consumers can fetch a list of active preorder campaigns. Optional latitude and longitude can be provided to calculate distance from the farmer.
 *     tags:
 *       - Preorders
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: User's current latitude for distance calculation
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: User's current longitude for distance calculation
 *     responses:
 *       200:
 *         description: Active campaigns retrieved
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude") ? parseFloat(searchParams.get("latitude") as string) : undefined;
    const longitude = searchParams.get("longitude") ? parseFloat(searchParams.get("longitude") as string) : undefined;

    const useCase = new GetCampaignsUseCase(preOrderRepository);
    const campaigns = await useCase.execute(latitude, longitude);

    return successResponse(campaigns, { message: "Active campaigns list retrieved" });
  } catch (error) {
    return handleRouteError(error, "GetAllCampaigns");
  }
}
