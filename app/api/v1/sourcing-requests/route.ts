import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-requests:
 *   get:
 *     summary: Get all open sourcing requests (Farmers only)
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
 *         description: List of open sourcing requests
 *       403:
 *         description: Forbidden (Not a farmer)
 */
// GET: Farmers can list all open sourcing requests
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    // Ensure the user is a farmer (optional, but good for restricting access to leads)
    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can view the public sourcing requests",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch all open sourcing requests
    const [requests, total] = await Promise.all([
      prisma.sourcingRequest.findMany({
        where: { status: "open" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: { id: true, name: true, avatarUrl: true },
          },
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.sourcingRequest.count({
        where: { status: "open" },
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
        buyer: {
          id: req.buyer.id,
          name: req.buyer.name,
          avatar_url: req.buyer.avatarUrl,
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
    console.error("Error fetching sourcing requests:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch sourcing requests",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/sourcing-requests:
 *   post:
 *     summary: Create a new sourcing request (Buyers)
 *     tags: [Sourcing Requests]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *               required_by:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Sourcing request created successfully
 *       400:
 *         description: Invalid input
 */
// POST: Buyers can create a new sourcing request
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const body = await request.json();

    const { title, description, budget, required_by } = body;

    if (!title) {
      return NextResponse.json(
        {
          status: "error",
          message: "title is required",
        },
        { status: 400 }
      );
    }

    const newRequest = await prisma.sourcingRequest.create({
      data: {
        buyerId: user.userId,
        title,
        description,
        budget: budget ? parseFloat(budget) : null,
        requiredBy: required_by ? new Date(required_by) : null,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          id: newRequest.id,
          title: newRequest.title,
          description: newRequest.description,
          status: newRequest.status,
          budget: newRequest.budget,
          required_by: newRequest.requiredBy,
          created_at: newRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating sourcing request:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create sourcing request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
