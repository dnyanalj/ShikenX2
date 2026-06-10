"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyExams = getMyExams;
exports.getTeacherDashboardStats = getTeacherDashboardStats;
const prisma_1 = require("../../lib/prisma");
async function getMyExams(teacherId) {
    const exams = await prisma_1.prisma.exam.findMany({
        where: { teacherId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            subject: true,
            status: true,
            createdAt: true,
            startsAt: true,
            endsAt: true,
            examKey: true,
            _count: {
                select: { sessions: true },
            },
        },
    });
    return exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        status: exam.status,
        createdAt: exam.createdAt,
        startsAt: exam.startsAt,
        endsAt: exam.endsAt,
        examKey: exam.examKey,
        studentsAttempted: exam._count.sessions,
    }));
}
async function getTeacherDashboardStats(teacherId) {
    const [totalExams, liveExams, endedExams, studentsAttempted] = await Promise.all([
        prisma_1.prisma.exam.count({ where: { teacherId } }),
        prisma_1.prisma.exam.count({ where: { teacherId, status: "live" } }),
        prisma_1.prisma.exam.count({ where: { teacherId, status: "ended" } }),
        prisma_1.prisma.student.count({
            where: {
                sessions: {
                    some: {
                        exam: { teacherId },
                    },
                },
            },
        }),
    ]);
    return {
        totalExams,
        studentsAttempted,
        liveExams,
        endedExams,
    };
}
