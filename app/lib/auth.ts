import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";

// JWT Secret - must be set in environment variables
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export interface TokenPayload extends JWTPayload {
  userId: string;
  user_type: string;
  type: "access" | "refresh";
}

/**
 * Sign an access token
 */
export async function signAccessToken(
  userId: string,
  user_type: string
): Promise<string> {
  return await new SignJWT({ userId, user_type, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Sign a refresh token
 */
export async function signRefreshToken(
  userId: string,
  user_type: string
): Promise<string> {
  return await new SignJWT({ userId, user_type, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as TokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Get refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  const now = new Date();
  now.setDate(now.getDate() + 7); // 7 days from now
  return now;
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify authentication from NextRequest
 * Helper function that combines extractBearerToken and verifyToken
 */
export async function verifyAuth(request: any): Promise<TokenPayload> {
  const authHeader = request.headers.get("authorization");
  console.log("Auth header:", authHeader);

  const token = extractBearerToken(authHeader);
  console.log("Extracted token:", token);

  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    throw new Error("Unauthorized: Invalid token");
  }

  return payload;
}

/**
 * Verify admin authentication from NextRequest
 * Ensures the user is authenticated AND has ADMIN role
 */
export async function verifyAdmin(request: any): Promise<TokenPayload> {
  const payload = await verifyAuth(request);

  if (payload.user_type !== "ADMIN") {
    const error: any = new Error("Forbidden: Admin access required");
    error.status = 403;
    throw error;
  }

  return payload;
}
