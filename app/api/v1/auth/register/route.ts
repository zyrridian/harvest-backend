import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth";
import { AppError, handleRouteError } from "@/lib/errors";
import { successResponse } from "@/lib/helpers/response";
import { parseBody } from "@/lib/helpers/parseBody";
import { RegisterSchema } from "@/lib/validation";
import { AUTH } from "@/config/constants";

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with email, password, and name
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    const { email, password, name, phone_number, user_type } =
      RegisterSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.badRequest("Email already registered");
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phoneNumber: phone_number || null,
        userType: user_type,
      },
    });

    // Generate tokens
    const accessToken = await signAccessToken(user.id, user.userType);
    const refreshToken = await signRefreshToken(user.id, user.userType);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const response = successResponse(
      {
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
      },
      { message: "Registration successful", status: 201 },
    );

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
    return handleRouteError(error, "Registration");
  }
}
