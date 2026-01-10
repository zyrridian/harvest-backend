import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, extractBearerToken } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/products/{id}/view:
 *   post:
 *     summary: Track product view for analytics
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View tracked
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID if authenticated (optional)
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId as string;
        }
      } catch {
        // Not authenticated, continue as anonymous
      }
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { status: "error", message: "Product not found" },
        { status: 404 }
      );
    }

    // Track view and increment view count
    await prisma.$transaction([
      prisma.productView.create({
        data: {
          productId: params.id,
          userId,
        },
      }),
      prisma.product.update({
        where: { id: params.id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "View tracked",
    });
  } catch (error: any) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to track view",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
