import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   post:
 *     summary: Like a comment
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment liked successfully
 *       400:
 *         description: Already liked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = params;

    const comment = await prisma.postComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        {
          status: "error",
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: user.userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        {
          status: "error",
          message: "You have already liked this comment",
        },
        { status: 400 }
      );
    }

    // Create like and update count
    await prisma.$transaction([
      prisma.commentLike.create({
        data: {
          commentId: id,
          userId: user.userId,
        },
      }),
      prisma.postComment.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "Comment liked successfully",
    });
  } catch (error: any) {
    console.error("Like comment error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to like comment",
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/community/comments/{id}/like:
 *   delete:
 *     summary: Unlike a comment
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment unliked successfully
 *       400:
 *         description: Not liked yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = params;

    const comment = await prisma.postComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        {
          status: "error",
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    // Check if liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: user.userId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        {
          status: "error",
          message: "You have not liked this comment",
        },
        { status: 400 }
      );
    }

    // Delete like and update count
    await prisma.$transaction([
      prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId: id,
            userId: user.userId,
          },
        },
      }),
      prisma.postComment.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "Comment unliked successfully",
    });
  } catch (error: any) {
    console.error("Unlike comment error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to unlike comment",
      },
      { status: error.status || 500 }
    );
  }
}
