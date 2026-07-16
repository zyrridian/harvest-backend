import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { parseBody } from "@/core/helpers/parseBody";
import { preOrderRepository } from "@/features/preorder/infrastructure/repositories/prisma-preorder.repository";
import { GetCampaignDetailUseCase } from "@/features/preorder/application/usecases/get-campaign-detail.usecase";
import prisma from "@/core/database/prisma";

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

/**
 * @swagger
 * /api/v1/preorders/campaigns/{id}:
 *   put:
 *     summary: Update a preorder campaign
 *     description: Update the details of an existing preorder campaign
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *               pricePerUnit:
 *                 type: number
 *               minimumOrderQuantity:
 *                 type: number
 *               targetQuantity:
 *                 type: number
 *               depositPercentage:
 *                 type: number
 *               estimatedHarvestDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await verifyAuth(request);
    const { id: campaignId } = await context.params;
    const body = await parseBody<any>(request);

    // Verify ownership
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw new Error("User is not a registered farmer");

    const existingCampaign = await preOrderRepository.findCampaignById(campaignId);
    if (!existingCampaign) {
      throw new Error("Campaign not found");
    }

    if (existingCampaign.farmerId !== farmer.id) {
      throw new Error("Unauthorized to update this campaign");
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.pricePerUnit !== undefined) updateData.pricePerUnit = Number(body.pricePerUnit);
    if (body.minimumOrderQuantity !== undefined) updateData.minimumOrderQuantity = Number(body.minimumOrderQuantity);
    if (body.targetQuantity !== undefined) updateData.targetQuantity = Number(body.targetQuantity);
    if (body.depositPercentage !== undefined) updateData.depositPercentage = Number(body.depositPercentage);
    if (body.estimatedHarvestDate !== undefined) updateData.estimatedHarvestDate = new Date(body.estimatedHarvestDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];

    const updatedCampaign = await preOrderRepository.updateCampaign(campaignId, updateData);

    return successResponse(updatedCampaign);
  } catch (error) {
    return handleRouteError(error, "UpdatePreorderCampaign");
  }
}

/**
 * @swagger
 * /api/v1/preorders/campaigns/{id}:
 *   delete:
 *     summary: Delete a preorder campaign
 *     description: Permanently delete a specific preorder campaign and its associated reservations.
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
 *         description: Campaign deleted successfully
 *       403:
 *         description: Unauthorized to delete this campaign
 *       404:
 *         description: Campaign not found
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await verifyAuth(request);
    const { id: campaignId } = await context.params;

    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw new Error("User is not a registered farmer");

    const existingCampaign = await preOrderRepository.findCampaignById(campaignId);
    if (!existingCampaign) {
      throw new Error("Campaign not found");
    }

    if (existingCampaign.farmerId !== farmer.id) {
      throw new Error("Unauthorized to delete this campaign");
    }

    await preOrderRepository.deleteCampaign(campaignId);

    return successResponse({ message: "Campaign deleted successfully" });
  } catch (error) {
    return handleRouteError(error, "DeletePreorderCampaign");
  }
}
