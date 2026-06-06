import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type Role = "teacher" | "student" | "admin";

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    (decoded.role !== "teacher" &&
      decoded.role !== "student" &&
      decoded.role !== "admin")
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
    email: decoded.email,
  };
}
