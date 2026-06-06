import type { Request, Response, NextFunction } from "express";
import { isProduction } from "../../config/env";
import { ACCESS_TOKEN_COOKIE } from "../../types/auth";
import * as authService from "./auth.service";

const COOKIE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function sendAuthResponse(res: Response, statusCode: number, result: Awaited<ReturnType<typeof authService.loginTeacher>>): void {
  setAccessTokenCookie(res, result.accessToken);
  res.status(statusCode).json(result);
}

export async function registerTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.registerTeacher(req.body);
    sendAuthResponse(res, 201, result);
  } catch (error) {
    next(error);
  }
}

export async function registerStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.registerStudent(req.body);
    sendAuthResponse(res, 201, result);
  } catch (error) {
    next(error);
  }
}

export async function loginTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.loginTeacher(req.body);
    sendAuthResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
}

export async function loginStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.loginStudent(req.body);
    sendAuthResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
}

export async function loginAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.loginAdmin(req.body);
    sendAuthResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await authService.getMe(req.user.sub, req.user.role);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
}
