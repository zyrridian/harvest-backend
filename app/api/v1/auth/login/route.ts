import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";
import { parseBody } from "@/lib/helpers/parseBody";
import { LoginSchema } from "@/lib/validation";
import { AUTH } from "@/config/constants";

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user and get access token
 *     description: Login with email and password to receive JWT tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    const { email, password } = LoginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      throw AppError.unauthorized("Invalid credentials");
    }

    // Update user online status
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    // Generate tokens
    const accessToken = await signAccessToken(user.id, user.userType);
    const refreshToken = await signRefreshToken(user.id, user.userType);

    // Store refresh token (delete old ones first)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone_number: user.phoneNumber,
        avatar_url: user.avatarUrl,
        user_type: user.userType,
        is_verified: user.isVerified,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: AUTH.ACCESS_TOKEN_EXPIRES_IN,
    });

    // Set refresh token as HTTP-only cookie for web clients
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH.REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleRouteError(error, "Login");
  }
}
