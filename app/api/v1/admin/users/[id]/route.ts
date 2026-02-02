import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
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
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await verifyAdmin(request);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        farmer: true,
        _count: {
          select: {
            buyerOrders: true,
            sellerOrders: true,
            products: true,
            reviews: true,
            communityPosts: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user as any;

    return NextResponse.json({
      status: "success",
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to get user",
      },
      { status: error.status || 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [CONSUMER, PRODUCER, ADMIN]
 *               is_verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await verifyAdmin(request);
    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.user_type) updateData.userType = body.user_type;
    if (body.is_verified !== undefined)
      updateData.isVerified = body.is_verified;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatarUrl: true,
        userType: true,
        isVerified: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "User updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to update user",
      },
      { status: error.status || 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
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
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await verifyAdmin(request);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete user",
      },
      { status: error.status || 500 },
    );
  }
}
