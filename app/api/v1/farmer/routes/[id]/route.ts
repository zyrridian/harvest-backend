import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

// GET /api/v1/farmer/routes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await verifyAuth(request);
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw AppError.notFound("Farmer profile not found");

    const route = await prisma.deliveryRoute.findFirst({
      where: { id, farmerId: farmer.id },
      include: {
        stops: {
          orderBy: { stopOrder: "asc" },
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                items: {
                  take: 2,
                  select: { productName: true, quantity: true },
                },
                buyer: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    if (!route) throw AppError.notFound("Route not found");

    return successResponse({
      route_id: route.id,
      delivery_date: route.deliveryDate,
      status: route.status,
      tracking_enabled: route.trackingEnabled,
      current_location: route.currentLat
        ? { lat: route.currentLat, lng: route.currentLng, updated_at: route.locationUpdatedAt }
        : null,
      total_distance_km: route.totalDistanceKm,
      estimated_minutes: route.estimatedMinutes,
      started_at: route.startedAt,
      completed_at: route.completedAt,
      stops: route.stops.map((s) => ({
        stop_id: s.id,
        stop_order: s.stopOrder,
        order_id: s.orderId,
        order_number: s.order.orderNumber,
        buyer_name: s.order.buyer.name,
        recipient_name: s.recipientName,
        address_label: s.addressLabel,
        address_lat: s.addressLat,
        address_lng: s.addressLng,
        status: s.status,
        estimated_arrival: s.estimatedArrival,
        actual_arrival: s.actualArrival,
        items: s.order.items,
        notes: s.notes,
      })),
    });
  } catch (error) {
    return handleRouteError(error, "Get route detail");
  }
}

// PATCH /api/v1/farmer/routes/[id] — update status, toggle tracking, update stop status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await verifyAuth(request);
    const farmer = await prisma.farmer.findUnique({ where: { userId: payload.userId } });
    if (!farmer) throw AppError.notFound("Farmer profile not found");

    const route = await prisma.deliveryRoute.findFirst({
      where: { id, farmerId: farmer.id },
    });
    if (!route) throw AppError.notFound("Route not found");

    const body = await request.json();
    const { status, tracking_enabled, stop_id, stop_status, stop_notes } = body;

    // Update stop status if provided
    if (stop_id) {
      await prisma.routeStop.update({
        where: { id: stop_id },
        data: {
          status: stop_status,
          notes: stop_notes,
          ...(stop_status === "arrived" && { actualArrival: new Date() }),
        },
      });
    }

    // Update route fields
    const updatedRoute = await prisma.deliveryRoute.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(tracking_enabled !== undefined && { trackingEnabled: tracking_enabled }),
        ...(status === "active" && !route.startedAt && { startedAt: new Date() }),
        ...(status === "completed" && { completedAt: new Date(), trackingEnabled: false }),
      },
    });

    return successResponse({
      route_id: updatedRoute.id,
      status: updatedRoute.status,
      tracking_enabled: updatedRoute.trackingEnabled,
    });
  } catch (error) {
    return handleRouteError(error, "Update route");
  }
}
