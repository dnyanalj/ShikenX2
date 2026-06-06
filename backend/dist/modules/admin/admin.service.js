"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = getPlatformStats;
exports.listTeachers = listTeachers;
exports.listStudents = listStudents;
const prisma_1 = require("../../lib/prisma");
async function getPlatformStats() {
    const [teacherCount, studentCount, adminCount, examCount, sessionCount] = await Promise.all([
        prisma_1.prisma.teacher.count(),
        prisma_1.prisma.student.count(),
        prisma_1.prisma.admin.count(),
        prisma_1.prisma.exam.count(),
        prisma_1.prisma.session.count(),
    ]);
    return {
        teacherCount,
        studentCount,
        adminCount,
        examCount,
        sessionCount,
    };
}
async function listTeachers(page, limit) {
    const skip = (page - 1) * limit;
    const [teachers, total] = await Promise.all([
        prisma_1.prisma.teacher.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { exams: true },
                },
            },
        }),
        prisma_1.prisma.teacher.count(),
    ]);
    return {
        data: teachers.map((teacher) => ({
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            isActive: teacher.isActive,
            createdAt: teacher.createdAt,
            examCount: teacher._count.exams,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function listStudents(page, limit) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
        prisma_1.prisma.student.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { sessions: true },
                },
            },
        }),
        prisma_1.prisma.student.count(),
    ]);
    return {
        data: students.map((student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            isActive: student.isActive,
            createdAt: student.createdAt,
            sessionCount: student._count.sessions,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
