import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyToken,
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";
import { AUTH } from "@/config/constants";

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token received during login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     token_type:
 *                       type: string
 *                       example: Bearer
 *                     expires_in:
 *                       type: integer
 *                       example: 3600
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let refreshTokenValue = body.refresh_token;

    // If no token in body, try to get from cookie
    if (!refreshTokenValue) {
      refreshTokenValue = request.cookies.get("refresh_token")?.value;
    }

    if (!refreshTokenValue) {
      throw AppError.badRequest("Refresh token is required");
    }

    // Verify the refresh token
    const payload = await verifyToken(refreshTokenValue);

    if (!payload || payload.type !== "refresh") {
      throw AppError.unauthorized("Invalid refresh token");
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken) {
      throw AppError.unauthorized("Refresh token not found");
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw AppError.unauthorized("Refresh token expired");
    }

    // Generate new tokens
    const newAccessToken = await signAccessToken(
      storedToken.user.id,
      storedToken.user.userType,
    );
    const newRefreshToken = await signRefreshToken(
      storedToken.user.id,
      storedToken.user.userType,
    );

    // Update refresh token in database (rotate token)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const response = successResponse({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: "Bearer",
      expires_in: AUTH.ACCESS_TOKEN_EXPIRES_IN,
    });

    // Update the refresh token cookie
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH.REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleRouteError(error, "Token refresh");
  }
}
