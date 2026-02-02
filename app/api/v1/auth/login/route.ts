import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth";

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
    // Parse body - support both JSON and form-data
    let body;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
    } else {
      body = await request.json();
    }

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Update user online status
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    // Generate tokens (userType is Prisma's camelCase property for user_type field)
    const accessToken = await signAccessToken(user.id, user.userType);
    const refreshToken = await signRefreshToken(user.id, user.userType);

    // Store refresh token in database (delete old ones first)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Prepare response (exclude password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone_number: user.phoneNumber,
      avatar_url: user.avatarUrl,
      user_type: user.userType,
      is_verified: user.isVerified,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };

    const response = NextResponse.json({
      status: "success",
      data: {
        user: userResponse,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600, // 1 hour in seconds
      },
    });

    // Set refresh token as HTTP-only cookie for web clients
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
