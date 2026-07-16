import { NextRequest } from "next/server";
import { verifyAuth } from "@/features/auth";
import { handleRouteError } from "@/core/errors";
import { successResponse } from "@/core/helpers/response";
import { AddToScheduleUseCase } from "@/features/harvest-schedule/application/usecases/add-to-schedule.usecase";
import { RemoveFromScheduleUseCase } from "@/features/harvest-schedule/application/usecases/remove-from-schedule.usecase";
import { harvestScheduleRepository } from "@/features/harvest-schedule/infrastructure/repositories/prisma-harvest-schedule.repository";

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

    return successResponse(null, { message: "Campaign added to schedule", status: 201 });
  } catch (error) {
    return handleRouteError(error, "AddToSchedule");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    const resolvedParams = await params;

    const useCase = new RemoveFromScheduleUseCase(harvestScheduleRepository);
    await useCase.execute(payload.userId, resolvedParams.campaignId);

    return successResponse(null, { message: "Campaign removed from schedule", status: 200 });
  } catch (error) {
    return handleRouteError(error, "RemoveFromSchedule");
  }
}
