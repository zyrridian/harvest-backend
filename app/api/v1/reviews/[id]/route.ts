import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
        // Await params in Next.js 15+
    const { id } = await context.params;

const payload = await verifyAuth(request);
    const { id: reviewId } = await context.params;
    const body = await request.json();

    const { rating, title, comment } = body;

    // Find review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { status: "error", message: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== payload.userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized to update this review" },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { status: "error", message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating: parseFloat(rating.toString()) }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Review updated successfully",
      data: {
        review_id: updatedReview.id,
        updated_at: updatedReview.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyAuth(request);
    const { id: reviewId } = await context.params;

    // Find review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { status: "error", message: "Review not found" },
        { status: 404 }
      );
    }

    if (review.userId !== payload.userId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized to delete this review" },
        { status: 403 }
      );
    }

    // Delete review (cascades to images and helpful marks)
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to delete review" },
      { status: 500 }
    );
  }
}
