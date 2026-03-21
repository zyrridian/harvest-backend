// Barrel re-export — keeps `import { ... } from "@/lib/auth"` working
export {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getRefreshTokenExpiry,
  extractBearerToken,
} from "./tokens";

export { hashPassword, comparePassword } from "./password";

export { verifyAuth, verifyAdmin } from "./guards";

// Re-export the TokenPayload type for convenience
export type { TokenPayload } from "@/types/auth";
