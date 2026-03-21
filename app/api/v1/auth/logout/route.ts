import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout current user session
 *     description: Invalidate the current refresh token and end the session
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);

    // Delete all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId },
    });

    // Update user online status
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isOnline: false, lastSeen: new Date() },
    });

    const response = successResponse(undefined, {
      message: "Logged out successfully",
    });

    // Clear the refresh token cookie
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleRouteError(error, "Logout");
  }
}
