import { prisma } from "../../lib/prisma";

export async function getPlatformStats() {
  const [teacherCount, studentCount, adminCount, examCount, sessionCount] =
    await Promise.all([
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.admin.count(),
      prisma.exam.count(),
      prisma.session.count(),
    ]);

  return {
    teacherCount,
    studentCount,
    adminCount,
    examCount,
    sessionCount,
  };
}

export async function listTeachers(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
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
    prisma.teacher.count(),
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

export async function listStudents(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
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
    prisma.student.count(),
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
