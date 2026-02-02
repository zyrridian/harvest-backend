import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/comments/{id}:
 *   delete:
 *     summary: Delete a comment
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
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const comment = await prisma.postComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        {
          status: "error",
          message: "Comment not found",
        },
        { status: 404 },
      );
    }

    if (comment.userId !== user.userId) {
      return NextResponse.json(
        {
          status: "error",
          message: "You do not have permission to delete this comment",
        },
        { status: 403 },
      );
    }

    await prisma.$transaction([
      prisma.postComment.delete({
        where: { id },
      }),
      prisma.communityPost.update({
        where: { id: comment.postId },
        data: {
          commentsCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete comment",
      },
      { status: error.status || 500 },
    );
  }
}
