import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../lib/jwt";
import { ACCESS_TOKEN_COOKIE } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid token for optional auth
    }
  }

  next();
}
