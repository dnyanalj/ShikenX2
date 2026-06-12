import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { generateUniqueExamKey } from "../lib/examKey";
import { validateBody } from "../middleware/validate";

const router = Router();

const examSelect = {
  id: true,
  teacherId: true,
  title: true,
  subject: true,
  duration: true,
  examKey: true,
  status: true,
  shuffleQuestions: true,
  passingMarks: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
} as const;

const examFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(100),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),
  startsAt: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endsAt: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  shuffleQuestions: z.boolean().default(false),
  passingMarks: z
    .number()
    .int("Passing marks must be a whole number")
    .min(0, "Passing marks must be at least 0")
    .max(100, "Passing marks cannot exceed 100"),
};

const createExamSchema = z
  .object(examFields)
  .refine((data) => data.startsAt < data.endsAt, {
    message: "Start date must be before end date",
    path: ["endsAt"],
  });

const updateExamSchema = z
  .object({
    title: examFields.title.optional(),
    subject: examFields.subject.optional(),
    duration: examFields.duration.optional(),
    startsAt: examFields.startsAt.optional(),
    endsAt: examFields.endsAt.optional(),
    shuffleQuestions: examFields.shuffleQuestions.optional(),
    passingMarks: examFields.passingMarks.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

function getTeacherId(req: Request): string {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }
  if (req.user.role !== "teacher") {
    throw new AppError(403, "Forbidden");
  }
  return req.user.sub;
}

async function findTeacherExam(teacherId: string, examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, teacherId },
    select: examSelect,
  });

  if (!exam) {
    throw new AppError(404, "Exam not found");
  }

  return exam;
}

function assertDraft(status: string, action: string): void {
  if (status !== "draft") {
    throw new AppError(400, `Only draft exams can be ${action}`);
  }
}

async function validateDateRange(startsAt: Date, endsAt: Date): Promise<void> {
  if (startsAt >= endsAt) {
    throw new AppError(400, "Start date must be before end date");
  }
}

// POST /api/exam/create
router.post(
  "/create",
  validateBody(createExamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const input = req.body as z.infer<typeof createExamSchema>;

      const exam = await prisma.exam.create({
        data: {
          teacherId,
          title: input.title,
          subject: input.subject,
          duration: input.duration,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          shuffleQuestions: input.shuffleQuestions,
          passingMarks: input.passingMarks,
          status: "draft",
        },
        select: examSelect,
      });

      res.status(201).json(exam);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/exam/:id
router.put(
  "/:id",
  validateBody(updateExamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.id as string;
      const input = req.body as z.infer<typeof updateExamSchema>;

      const existing = await findTeacherExam(teacherId, examId);
      assertDraft(existing.status, "updated");

      const startsAt = input.startsAt ?? existing.startsAt;
      const endsAt = input.endsAt ?? existing.endsAt;
      await validateDateRange(startsAt, endsAt);

      const exam = await prisma.exam.update({
        where: { id: examId },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.subject !== undefined && { subject: input.subject }),
          ...(input.duration !== undefined && { duration: input.duration }),
          ...(input.startsAt !== undefined && { startsAt: input.startsAt }),
          ...(input.endsAt !== undefined && { endsAt: input.endsAt }),
          ...(input.shuffleQuestions !== undefined && {
            shuffleQuestions: input.shuffleQuestions,
          }),
          ...(input.passingMarks !== undefined && {
            passingMarks: input.passingMarks,
          }),
        },
        select: examSelect,
      });

      res.json(exam);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/exam/:id/publish 
router.post(
  "/:id/publish",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.id as string;

      const existing = await findTeacherExam(teacherId, examId);
      assertDraft(existing.status, "published");

      const examKey = await generateUniqueExamKey();

      const exam = await prisma.exam.update({
        where: { id: examId },
        data: {
          status: "live",
          examKey,
        },
        select: examSelect,
      });

      res.json(exam);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
