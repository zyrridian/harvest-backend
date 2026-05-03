import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

// POST /api/v1/farmer/routes/[id]/location
// Farmer pushes GPS update. Stores ephemeral current location on route.
// Also inserts a ping for history (purged by cron after 24h).
// Body: { latitude, longitude, accuracy? }
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyAuth(request);
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw AppError.notFound("Farmer profile not found");

    const route = await prisma.deliveryRoute.findFirst({
      where: { id: params.id, farmerId: farmer.id, status: "active" },
    });
    if (!route) throw AppError.notFound("Active route not found");

    if (!route.trackingEnabled) {
      throw AppError.badRequest("Tracking is disabled for this route");
    }

    const body = await request.json();
    const { latitude, longitude, accuracy } = body;
    if (!latitude || !longitude) {
      throw AppError.badRequest("latitude and longitude required");
    }

    // Update current location on route (no history kept past 24h)
    await prisma.deliveryRoute.update({
      where: { id: params.id },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        locationUpdatedAt: new Date(),
      },
    });

    // Insert ping for trail (buyers can see last 30 minutes of trail)
    await prisma.deliveryLocationPing.create({
      data: { routeId: params.id, latitude, longitude, accuracy: accuracy ?? null },
    });

    // Purge pings older than 24h for this route (keep DB clean)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.deliveryLocationPing.deleteMany({
      where: { routeId: params.id, createdAt: { lt: cutoff } },
    });

    return successResponse({ ok: true, updated_at: new Date() });
  } catch (error) {
    return handleRouteError(error, "Push location");
  }
}
