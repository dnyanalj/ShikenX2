import type { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await adminService.getPlatformStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export async function getTeachers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.listTeachers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStudents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.listStudents(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
