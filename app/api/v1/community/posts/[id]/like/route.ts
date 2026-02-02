import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/community/posts/{id}/like:
 *   post:
 *     summary: Like a community post
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
 *         description: Post liked successfully
 *       400:
 *         description: Already liked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        {
          status: "error",
          message: "You have already liked this post",
        },
        { status: 400 },
      );
    }

    // Create like and update count
    await prisma.$transaction([
      prisma.postLike.create({
        data: {
          postId: id,
          userId: user.userId,
        },
      }),
      prisma.communityPost.update({
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
      message: "Post liked successfully",
    });
  } catch (error: any) {
    console.error("Like post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to like post",
      },
      { status: error.status || 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/community/posts/{id}/like:
 *   delete:
 *     summary: Unlike a community post
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
 *         description: Post unliked successfully
 *       400:
 *         description: Not liked yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    // Check if liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.userId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        {
          status: "error",
          message: "You have not liked this post",
        },
        { status: 400 },
      );
    }

    // Delete like and update count
    await prisma.$transaction([
      prisma.postLike.delete({
        where: {
          postId_userId: {
            postId: id,
            userId: user.userId,
          },
        },
      }),
      prisma.communityPost.update({
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
      message: "Post unliked successfully",
    });
  } catch (error: any) {
    console.error("Unlike post error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to unlike post",
      },
      { status: error.status || 500 },
    );
  }
}
