import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { validateBody } from "../middleware/validate";

const router = Router();

const questionSelect = {
  id: true,
  examId: true,
  text: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  correctOption: true,
  marks: true,
} as const;

const questionFields = {
  text: z.string().trim().min(1, "Question text is required"),
  optionA: z.string().trim().min(1, "Option A is required"),
  optionB: z.string().trim().min(1, "Option B is required"),
  optionC: z.string().trim().min(1, "Option C is required"),
  optionD: z.string().trim().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"], {
    errorMap: () => ({ message: "Correct option must be A, B, C, or D" }),
  }),
  marks: z
    .number()
    .int("Marks must be a whole number")
    .min(1, "Marks must be at least 1")
    .max(100, "Marks cannot exceed 100"),
};

const createQuestionSchema = z.object(questionFields);

const updateQuestionSchema = z
  .object({
    text: questionFields.text.optional(),
    optionA: questionFields.optionA.optional(),
    optionB: questionFields.optionB.optional(),
    optionC: questionFields.optionC.optional(),
    optionD: questionFields.optionD.optional(),
    correctOption: questionFields.correctOption.optional(),
    marks: questionFields.marks.optional(),
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
    select: { id: true, status: true },
  });

  if (!exam) {
    throw new AppError(404, "Exam not found");
  }

  return exam;
}

function assertDraft(status: string, action: string): void {
  if (status !== "draft") {
    throw new AppError(400, `Only draft exams can have questions ${action}`);
  }
}

async function findTeacherQuestion(
  teacherId: string,
  examId: string,
  questionId: string,
) {
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      examId,
      exam: { teacherId },
    },
    select: questionSelect,
  });

  if (!question) {
    throw new AppError(404, "Question not found");
  }

  return question;
}

// GET /api/exam/:examId/questions
router.get(
  "/:examId/questions",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.examId as string;
      //to check if this exam belongs to this teacher
      await findTeacherExam(teacherId, examId);

      const questions = await prisma.question.findMany({
        where: { examId },
        select: questionSelect,
        orderBy: { id: "asc" },
      });

      res.json({ data: questions });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/exam/:examId/questions
router.post(
  "/:examId/questions",
  validateBody(createQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.examId as string;
      const input = req.body as z.infer<typeof createQuestionSchema>;

      const exam = await findTeacherExam(teacherId, examId);
      assertDraft(exam.status, "added to");

      const question = await prisma.question.create({
        data: {
          examId,
          text: input.text,
          optionA: input.optionA,
          optionB: input.optionB,
          optionC: input.optionC,
          optionD: input.optionD,
          correctOption: input.correctOption,
          marks: input.marks,
        },
        select: questionSelect,
      });

      res.status(201).json(question);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/exam/:examId/questions/:questionId
router.put(
  "/:examId/questions/:questionId",
  validateBody(updateQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.examId as string;
      const questionId = req.params.questionId as string;
      const input = req.body as z.infer<typeof updateQuestionSchema>;

      const exam = await findTeacherExam(teacherId, examId);
      assertDraft(exam.status, "updated in");

      await findTeacherQuestion(teacherId, examId, questionId);

      const question = await prisma.question.update({
        where: { id: questionId },
        data: {
          ...(input.text !== undefined && { text: input.text }),
          ...(input.optionA !== undefined && { optionA: input.optionA }),
          ...(input.optionB !== undefined && { optionB: input.optionB }),
          ...(input.optionC !== undefined && { optionC: input.optionC }),
          ...(input.optionD !== undefined && { optionD: input.optionD }),
          ...(input.correctOption !== undefined && {
            correctOption: input.correctOption,
          }),
          ...(input.marks !== undefined && { marks: input.marks }),
        },
        select: questionSelect,
      });

      res.json(question);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/exam/:examId/questions/:questionId
router.delete(
  "/:examId/questions/:questionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = getTeacherId(req);
      const examId = req.params.examId as string;
      const questionId = req.params.questionId as string;

      const exam = await findTeacherExam(teacherId, examId);
      assertDraft(exam.status, "deleted from");

      await findTeacherQuestion(teacherId, examId, questionId);

      await prisma.question.delete({ where: { id: questionId } });

      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
