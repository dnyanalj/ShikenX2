"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const errors_1 = require("../lib/errors");
const examKey_1 = require("../lib/examKey");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
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
};
const examFields = {
    title: zod_1.z.string().trim().min(1, "Title is required").max(200),
    subject: zod_1.z.string().trim().min(1, "Subject is required").max(100),
    duration: zod_1.z
        .number()
        .int("Duration must be a whole number")
        .min(1, "Duration must be at least 1 minute")
        .max(600, "Duration cannot exceed 600 minutes"),
    startsAt: zod_1.z.coerce.date({ invalid_type_error: "Invalid start date" }),
    endsAt: zod_1.z.coerce.date({ invalid_type_error: "Invalid end date" }),
    shuffleQuestions: zod_1.z.boolean().default(false),
    passingMarks: zod_1.z
        .number()
        .int("Passing marks must be a whole number")
        .min(0, "Passing marks must be at least 0")
        .max(100, "Passing marks cannot exceed 100"),
};
const createExamSchema = zod_1.z
    .object(examFields)
    .refine((data) => data.startsAt < data.endsAt, {
    message: "Start date must be before end date",
    path: ["endsAt"],
});
const updateExamSchema = zod_1.z
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
        select: examSelect,
    });
    if (!exam) {
        throw new errors_1.AppError(404, "Exam not found");
    }
    return exam;
}
function assertDraft(status, action) {
    if (status !== "draft") {
        throw new errors_1.AppError(400, `Only draft exams can be ${action}`);
    }
}
async function validateDateRange(startsAt, endsAt) {
    if (startsAt >= endsAt) {
        throw new errors_1.AppError(400, "Start date must be before end date");
    }
}
// POST /api/exam/create
router.post("/create", (0, validate_1.validateBody)(createExamSchema), async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const input = req.body;
        const exam = await prisma_1.prisma.exam.create({
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
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/exam/:id
router.put("/:id", (0, validate_1.validateBody)(updateExamSchema), async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.id;
        const input = req.body;
        const existing = await findTeacherExam(teacherId, examId);
        assertDraft(existing.status, "updated");
        const startsAt = input.startsAt ?? existing.startsAt;
        const endsAt = input.endsAt ?? existing.endsAt;
        await validateDateRange(startsAt, endsAt);
        const exam = await prisma_1.prisma.exam.update({
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
    }
    catch (error) {
        next(error);
    }
});
// POST /api/exam/:id/publish 
router.post("/:id/publish", async (req, res, next) => {
    try {
        const teacherId = getTeacherId(req);
        const examId = req.params.id;
        const existing = await findTeacherExam(teacherId, examId);
        assertDraft(existing.status, "published");
        const examKey = await (0, examKey_1.generateUniqueExamKey)();
        const exam = await prisma_1.prisma.exam.update({
            where: { id: examId },
            data: {
                status: "live",
                examKey,
            },
            select: examSelect,
        });
        res.json(exam);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
