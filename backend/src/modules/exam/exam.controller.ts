import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../lib/errors";
import * as examService from "./exam.service";

export async function getMyExams(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const exams = await examService.getMyExams(req.user.sub);
    res.json({ data: exams });
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const stats = await examService.getTeacherDashboardStats(req.user.sub);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
