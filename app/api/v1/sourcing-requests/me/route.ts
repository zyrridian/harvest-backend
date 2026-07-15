import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-requests/me:
 *   get:
 *     summary: Get buyer's own sourcing requests
 *     tags: [Sourcing Requests]
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
 *         description: List of the buyer's sourcing requests
 *       401:
 *         description: Unauthorized
 */
// GET: Buyers can list their own sourcing requests
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.sourcingRequest.findMany({
        where: { buyerId: user.userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.sourcingRequest.count({
        where: { buyerId: user.userId },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      data: requests.map((req) => ({
        id: req.id,
        title: req.title,
        description: req.description,
        status: req.status,
        budget: req.budget,
        required_by: req.requiredBy,
        created_at: req.createdAt,
        offers_count: req._count.offers,
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching my sourcing requests:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch your sourcing requests",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
