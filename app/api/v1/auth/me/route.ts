import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Retrieve the currently logged in user's information
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw AppError.notFound("User not found");
    }

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      phone_number: user.phoneNumber,
      avatar_url: user.avatarUrl,
      user_type: user.userType,
      is_verified: user.isVerified,
      is_online: user.isOnline,
      last_seen: user.lastSeen?.toISOString() || null,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleRouteError(error, "Get me");
  }
}
