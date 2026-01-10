import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  verifyToken, 
  signAccessToken, 
  signRefreshToken, 
  getRefreshTokenExpiry 
} from '@/lib/auth';

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
      refreshTokenValue = request.cookies.get('refresh_token')?.value;
    }

    if (!refreshTokenValue) {
      return NextResponse.json(
        { status: 'error', message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const payload = await verifyToken(refreshTokenValue);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { status: 'error', message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken) {
      return NextResponse.json(
        { status: 'error', message: 'Refresh token not found' },
        { status: 401 }
      );
    }

    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      return NextResponse.json(
        { status: 'error', message: 'Refresh token expired' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = await signAccessToken(storedToken.user.id, storedToken.user.userType);
    const newRefreshToken = await signRefreshToken(storedToken.user.id, storedToken.user.userType);

    // Update refresh token in database (rotate token)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const response = NextResponse.json({
      status: 'success',
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: 3600, // 1 hour in seconds
      },
    });

    // Update the refresh token cookie
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
