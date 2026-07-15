import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-offers/me:
 *   get:
 *     summary: Get all sourcing offers submitted by the current farmer
 *     tags: [Sourcing Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of sourcing offers made by the farmer
 *       403:
 *         description: Forbidden (Not a farmer)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can view their own sourcing offers",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      prisma.sourcingOffer.findMany({
        where: { farmerId: farmer.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          request: {
            select: {
              id: true,
              title: true,
              description: true,
              budget: true,
              status: true,
              requiredBy: true,
            },
          },
        },
      }),
      prisma.sourcingOffer.count({
        where: { farmerId: farmer.id },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      data: offers.map((offer) => ({
        id: offer.id,
        price: offer.price,
        notes: offer.notes,
        status: offer.status,
        created_at: offer.createdAt,
        request: {
          id: offer.request.id,
          title: offer.request.title,
          description: offer.request.description,
          budget: offer.request.budget,
          status: offer.request.status,
          required_by: offer.request.requiredBy,
        },
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching my sourcing offers:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch your sourcing offers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
