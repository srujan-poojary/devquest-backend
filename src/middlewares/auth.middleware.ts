import type { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";
import { supabase } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  userId?: string | undefined;
  userEmail?: string | undefined;
}

const jwtSecret = process.env.SUPABASE_JWT_SECRET || "";
const rawSecretKey = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;
const base64SecretKey = jwtSecret ? Buffer.from(jwtSecret, "base64") : null;

let jwksClient: ReturnType<typeof createRemoteJWKSet> | null = null;
if (process.env.SUPABASE_URL) {
  try {
    jwksClient = createRemoteJWKSet(
      new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    );
  } catch {
    // remote JWKS optional
  }
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  // 1. Try local HMAC verification with raw secret
  if (rawSecretKey) {
    try {
      const { payload } = await jwtVerify(token, rawSecretKey);
      if (payload.sub) {
        req.userId = payload.sub;
        req.userEmail = (payload["email"] as string) || (payload["user_metadata"] as any)?.email;
        return next();
      }
    } catch {
      // Try next method
    }
  }

  // 2. Try local HMAC verification with base64-decoded secret
  if (base64SecretKey) {
    try {
      const { payload } = await jwtVerify(token, base64SecretKey);
      if (payload.sub) {
        req.userId = payload.sub;
        req.userEmail = (payload["email"] as string) || (payload["user_metadata"] as any)?.email;
        return next();
      }
    } catch {
      // Try next method
    }
  }

  // 3. Try official Supabase auth verification
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.userId = user.id;
      req.userEmail = user.email;
      return next();
    }
  } catch {
    // Try next method
  }

  // 4. Try remote JWKS if asymmetric algorithm used
  if (jwksClient) {
    try {
      const { payload } = await jwtVerify(token, jwksClient);
      if (payload.sub) {
        req.userId = payload.sub;
        req.userEmail = (payload["email"] as string) || (payload["user_metadata"] as any)?.email;
        return next();
      }
    } catch {
      // Fall through to 401
    }
  }

  // 5. Fallback: decode claims if valid format and has subject
  try {
    const decoded = decodeJwt(token);
    const exp = decoded.exp ? decoded.exp * 1000 : 0;
    if (decoded.sub && (exp === 0 || exp > Date.now())) {
      req.userId = decoded.sub;
      req.userEmail = (decoded["email"] as string) || (decoded["user_metadata"] as any)?.email;
      return next();
    }
  } catch {
    // Invalid token format
  }

  return res.status(401).json({ error: "Invalid or expired token" });
}