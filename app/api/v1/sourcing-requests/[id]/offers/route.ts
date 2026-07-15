import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/database/prisma";
import { verifyAuth } from "@/features/auth";

/**
 * @swagger
 * /api/v1/sourcing-requests/{id}/offers:
 *   get:
 *     summary: View all offers for a specific sourcing request
 *     tags: [Sourcing Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sourcing Request ID
 *     responses:
 *       200:
 *         description: List of offers
 *       404:
 *         description: Sourcing request not found
 */
// GET: View all offers for a specific request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id: requestId } = await params;

    const sourcingRequest = await prisma.sourcingRequest.findUnique({
      where: { id: requestId },
    });

    if (!sourcingRequest) {
      return NextResponse.json(
        { status: "error", message: "Sourcing request not found" },
        { status: 404 }
      );
    }

    // Only the buyer who created the request OR a farmer can view offers. 
    // We can restrict it so only the buyer can see all offers, or farmers can see competing offers.
    // For now, let's just return it if authenticated.

    const offers = await prisma.sourcingOffer.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            rating: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      data: offers.map((offer) => ({
        id: offer.id,
        price: offer.price,
        notes: offer.notes,
        status: offer.status,
        created_at: offer.createdAt,
        farmer: {
          id: offer.farmer.id,
          name: offer.farmer.name,
          profile_image: offer.farmer.profileImage,
          rating: offer.farmer.rating,
          is_verified: offer.farmer.isVerified,
        },
      })),
    });
  } catch (error: any) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch offers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/sourcing-requests/{id}/offers:
 *   post:
 *     summary: Submit an offer for a sourcing request (Farmers only)
 *     tags: [Sourcing Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sourcing Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer submitted successfully
 *       400:
 *         description: Invalid input or request is not open
 *       403:
 *         description: Forbidden (Not a farmer)
 */
// POST: Farmers can create an offer for a request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id: requestId } = await params;
    const body = await request.json();
    const { price, notes } = body;

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.userId },
    });

    if (!farmer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only farmers can submit offers",
        },
        { status: 403 }
      );
    }

    const sourcingRequest = await prisma.sourcingRequest.findUnique({
      where: { id: requestId },
    });

    if (!sourcingRequest || sourcingRequest.status !== "open") {
      return NextResponse.json(
        {
          status: "error",
          message: "Sourcing request is not available",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        {
          status: "error",
          message: "price is required",
        },
        { status: 400 }
      );
    }

    const offer = await prisma.sourcingOffer.create({
      data: {
        requestId,
        farmerId: farmer.id,
        price: parseFloat(price),
        notes,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          id: offer.id,
          price: offer.price,
          notes: offer.notes,
          status: offer.status,
          created_at: offer.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting offer:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to submit offer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
