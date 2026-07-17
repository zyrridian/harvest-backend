import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { AddToScheduleUseCase } from "@/features/harvest-schedule/application/usecases/add-to-schedule.usecase";
import { RemoveFromScheduleUseCase } from "@/features/harvest-schedule/application/usecases/remove-from-schedule.usecase";
import { harvestScheduleRepository } from "@/features/harvest-schedule/infrastructure/repositories/prisma-harvest-schedule.repository";

/**
 * @swagger
 * /api/v1/preorders/schedule/campaigns/{campaignId}:
 *   post:
 *     summary: Add campaign to harvest schedule
 *     description: Adds a preorder campaign to the user's harvest schedule
 *     tags:
 *       - Preorders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reminders_enabled:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Campaign added to schedule successfully
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    const resolvedParams = await params;
    let remindersEnabled = true;

    try {
      const body = await request.json();
      if (body.reminders_enabled !== undefined) {
        remindersEnabled = body.reminders_enabled;
      }
    } catch (e) {
      // Body is optional
    }

    const useCase = new AddToScheduleUseCase(harvestScheduleRepository);
    await useCase.execute(payload.userId, resolvedParams.campaignId, remindersEnabled);

    return successResponse({ isScheduled: true }, { message: "Campaign added to schedule", status: 201 });
  } catch (error) {
    return handleRouteError(error, "AddToSchedule");
  }
}

/**
 * @swagger
 * /api/v1/preorders/schedule/campaigns/{campaignId}:
 *   delete:
 *     summary: Remove campaign from harvest schedule
 *     description: Removes a preorder campaign from the user's harvest schedule
 *     tags:
 *       - Preorders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign removed from schedule successfully
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    const resolvedParams = await params;

    const useCase = new RemoveFromScheduleUseCase(harvestScheduleRepository);
    await useCase.execute(payload.userId, resolvedParams.campaignId);

    return successResponse({ isScheduled: false }, { message: "Campaign removed from schedule", status: 200 });
  } catch (error) {
    return handleRouteError(error, "RemoveFromSchedule");
  }
}
