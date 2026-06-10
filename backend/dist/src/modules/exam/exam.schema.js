"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamSchema = exports.createExamSchema = void 0;
const zod_1 = require("zod");
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
exports.createExamSchema = zod_1.z
    .object(examFields)
    .refine((data) => data.startsAt < data.endsAt, {
    message: "Start date must be before end date",
    path: ["endsAt"],
});
exports.updateExamSchema = zod_1.z
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
