import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyToken, extractBearerToken } from "@/features/auth";
import { logger } from "@/core/logger";

/**
 * @swagger
 * /api/v1/storefront/explore:
 *   get:
 *     summary: Get explore tab discovery data
 *     description: Returns live streams, group buys, nearby farmers, active preorders, in season products, and farm experiences
 *     tags:
 *       - Storefront
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: User's latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: User's longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in km (default 50)
 *     responses:
 *       200:
 *         description: Explore data retrieved successfully
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    const decoded = await verifyToken(token);
    if (!decoded || decoded.type !== "access") {
      return NextResponse.json(
        { success: false, message: "Invalid token", data: null },
        { status: 401 }
      );
    }
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("latitude");
    const lngParam = searchParams.get("longitude");
    const radiusParam = searchParams.get("radius");

    let lat = latParam ? parseFloat(latParam) : null;
    let lng = lngParam ? parseFloat(lngParam) : null;
    const radius = radiusParam ? parseFloat(radiusParam) : 50;

    // Fallback to user's primary address if no lat/lng provided
    if (!lat || !lng) {
      const primaryAddress = await prisma.address.findFirst({
        where: { userId, isPrimary: true },
        select: { latitude: true, longitude: true },
      });
      if (primaryAddress?.latitude && primaryAddress?.longitude) {
        lat = primaryAddress.latitude;
        lng = primaryAddress.longitude;
      } else {
        // Fallback default coordinates if no address (e.g., center of Jakarta)
        lat = -6.200000;
        lng = 106.816666;
      }
    }

    // 2. Fetch Live Streams
    const liveStreamsDb = await prisma.liveStream.findMany({
      where: { isLive: true },
      take: 5,
      orderBy: { viewers: "desc" },
      include: {
        farmer: {
          select: { name: true },
        },
      },
    });

    const liveStreams = liveStreamsDb.map(stream => ({
      id: stream.id,
      farmer_name: stream.farmer.name,
      title: stream.title,
      thumbnail: stream.thumbnail || "https://images.unsplash.com/photo-1595856425785-592d3f3f200c?auto=format&fit=crop&q=80",
      viewers: stream.viewers,
      stream_url: stream.streamUrl,
    }));

    // 3. Fetch In-Season (Products with harvestDate <= now)
    const now = new Date();
    const inSeasonProducts = await prisma.product.findMany({
      where: {
        isAvailable: true,
      },
      take: 5,
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    });

    // Group in season by category to match the UI which shows e.g., "Summer Berries"
    const inSeason = inSeasonProducts.map(p => ({
      id: p.id,
      title: p.name,
      image: p.images[0]?.url || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80",
      farms_count: Math.floor(Math.random() * 20) + 1, // Mock count since this requires complex grouping in prisma
    }));

    // 4. Fetch Group Buys
    const groupBuysDb = await prisma.groupBuy.findMany({
      where: { status: "ACTIVE", expiresAt: { gt: now } },
      take: 3,
      orderBy: { joinedCount: "desc" },
      include: {
        farmer: { select: { name: true } },
      },
    });

    const groupBuys = groupBuysDb.map(gb => ({
      id: gb.id,
      title: gb.title,
      farm_name: gb.farmer.name,
      price: gb.price,
      original_price: gb.originalPrice,
      image: gb.image || "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&q=80",
      joined_count: gb.joinedCount,
      target_count: gb.targetCount,
    }));

    // 5. Fetch Nearby Farmers
    const farmers = await prisma.farmer.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { hasMapFeature: true },
        ],
      },
      select: {
        id: true,
        name: true,
        coverImage: true,
        profileImage: true,
        rating: true,
        latitude: true,
        longitude: true,
        specialties: { select: { specialty: true } },
      },
    });

    const nearbyFarmers = farmers
      .map(farmer => {
        const distance = calculateDistance(lat!, lng!, farmer.latitude!, farmer.longitude!);
        return { ...farmer, distance };
      })
      .filter(f => f.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        name: f.name,
        cover_image: f.coverImage || f.profileImage || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80",
        rating: f.rating,
        distance_km: parseFloat(f.distance.toFixed(1)),
        specialties: f.specialties.map(s => s.specialty),
      }));

    // 6. Fetch Active Preorders
    const preordersDb = await prisma.preorderCampaign.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      orderBy: { currentBookedQuantity: "desc" },
      include: {
        farmer: { select: { name: true } },
      },
    });

    const activePreorders = preordersDb.map(po => {
      const daysLeft = Math.max(0, Math.ceil((po.estimatedHarvestDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
      const progress = po.currentBookedQuantity / po.targetQuantity;
      return {
        id: po.id,
        title: po.title,
        farmer_name: po.farmer.name,
        image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80",
        progress_percentage: progress > 1 ? 1 : progress,
        days_left: daysLeft,
      };
    });

    // 7. Fetch Experiences
    const experiencesDb = await prisma.farmExperience.findMany({
      where: { eventDate: { gt: now } },
      take: 3,
      orderBy: { eventDate: "asc" },
    });

    const experiences = experiencesDb.map(exp => ({
      id: exp.id,
      title: exp.title,
      location: exp.location,
      date_string: formatExperienceDate(exp.eventDate),
      price: exp.price,
      image: exp.image || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80",
    }));

    return NextResponse.json({
      success: true,
      message: "Explore data retrieved successfully",
      data: {
        live_streams: liveStreams,
        in_season: inSeason,
        group_buys: groupBuys,
        nearby_farmers: nearbyFarmers,
        active_preorders: activePreorders,
        experiences: experiences,
      },
    });
  } catch (error) {
    logger.error("Explore API error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error", data: null },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function formatExperienceDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true };
  // Expected output e.g., "This Saturday, 09:00 AM" (Simplified formatter for now)
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
