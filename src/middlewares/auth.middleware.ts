import type { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

export interface AuthenticatedRequest extends Request {
  userId?: string | undefined;
  userEmail?: string | undefined;
}

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.userId = payload.sub;
    req.userEmail = payload["email"] as string;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}