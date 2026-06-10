import { prisma } from "../../lib/prisma";

export async function getMyExams(teacherId: string) {
  const exams = await prisma.exam.findMany({
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

export async function getTeacherDashboardStats(teacherId: string) {
  const [totalExams, liveExams, endedExams, studentsAttempted] =
    await Promise.all([
      prisma.exam.count({ where: { teacherId } }),
      prisma.exam.count({ where: { teacherId, status: "live" } }),
      prisma.exam.count({ where: { teacherId, status: "ended" } }),
      prisma.student.count({
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
