"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../lib/errors");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
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
};
const questionFields = {
    text: zod_1.z.string().trim().min(1, "Question text is required"),
    optionA: zod_1.z.string().trim().min(1, "Option A is required"),
    optionB: zod_1.z.string().trim().min(1, "Option B is required"),
    optionC: zod_1.z.string().trim().min(1, "Option C is required"),
    optionD: zod_1.z.string().trim().min(1, "Option D is required"),
    correctOption: zod_1.z.enum(["A", "B", "C", "D"], {
        errorMap: () => ({ message: "Correct option must be A, B, C, or D" }),
    }),
    marks: zod_1.z
        .number()
        .int("Marks must be a whole number")
        .min(1, "Marks must be at least 1")
        .max(100, "Marks cannot exceed 100"),
};
const createQuestionSchema = zod_1.z.object(questionFields);
const updateQuestionSchema = zod_1.z
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
function getTeacherId(req) {
    if (!req.user) {
        throw new errors_1.AppError(401, "Authentication required");
    }
    if (req.user.role !== "teacher") {
        throw new errors_1.AppError(403, "Forbidden");
    }
    return req.user.sub;
}
async function findTeacherExam(teacherId, examId) {
    const exam = await prisma_1.prisma.exam.findFirst({
        where: { id: examId, teacherId },
        select: { id: true, status: true },
    });
    if (!exam) {
        throw new errors_1.AppError(404, "Exam not found");
    }
    return exam;
}
function assertDraft(status, action) {
    if (status !== "draft") {
        throw new errors_1.AppError(400, `Only draft exams can have questions ${action}`);
    }
}
async function findTeacherQuestion(teacherId, examId, questionId) {
    const question = await prisma_1.prisma.question.findFirst({
        where: {
            id: questionId,
            examId,
            exam: { teacherId },
        },
        select: questionSelect,
    });
    if (!question) {
        throw new errors_1.AppError(404, "Question not found");
    }
    return question;
}
// GET /api/exam/:examId/questions
router.get("/:examId/questions", async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.examId;
        await findTeacherExam(teacherId, examId);
        const questions = await prisma_1.prisma.question.findMany({
            where: { examId },
            select: questionSelect,
            orderBy: { id: "asc" },
        });
        res.json({ data: questions });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/exam/:examId/questions
router.post("/:examId/questions", (0, validate_1.validateBody)(createQuestionSchema), async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.examId;
        const input = req.body;
        const exam = await findTeacherExam(teacherId, examId);
        assertDraft(exam.status, "added to");
        const question = await prisma_1.prisma.question.create({
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
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/exam/:examId/questions/:questionId
router.put("/:examId/questions/:questionId", (0, validate_1.validateBody)(updateQuestionSchema), async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.examId;
        const questionId = req.params.questionId;
        const input = req.body;
        const exam = await findTeacherExam(teacherId, examId);
        assertDraft(exam.status, "updated in");
        await findTeacherQuestion(teacherId, examId, questionId);
        const question = await prisma_1.prisma.question.update({
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
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/exam/:examId/questions/:questionId
router.delete("/:examId/questions/:questionId", async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.examId;
        const questionId = req.params.questionId;
        const exam = await findTeacherExam(teacherId, examId);
        assertDraft(exam.status, "deleted from");
        await findTeacherQuestion(teacherId, examId, questionId);
        await prisma_1.prisma.question.delete({ where: { id: questionId } });
        res.json({ message: "Question deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
