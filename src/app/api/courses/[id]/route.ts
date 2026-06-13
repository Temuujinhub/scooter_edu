import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { safeJson } from '@/lib/utils';

// GET /api/courses/[id] — Курсийн дэлгэрэнгүй + модулиуд + хэрэглэгчийн явц
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { modules: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  });
  if (!course) return fail('Курс олдсонгүй', 404);

  const session = await getSession();
  let enrollment = null;
  let progressMap: Record<string, string> = {};

  if (session) {
    enrollment = await prisma.enrollment.findFirst({
      where: { userId: session.sub, courseId: course.id },
    });
    const progress = await prisma.moduleProgress.findMany({
      where: { userId: session.sub, moduleId: { in: course.modules.map((m) => m.id) } },
    });
    progressMap = Object.fromEntries(progress.map((p) => [p.moduleId, p.status]));
  }

  return ok({
    id: course.id,
    code: course.code,
    titleMn: course.titleMn,
    descriptionMn: course.descriptionMn,
    price: course.price,
    durationHours: course.durationHours,
    level: course.level,
    enrollment: enrollment
      ? { status: enrollment.status }
      : null,
    modules: course.modules.map((m) => ({
      id: m.id,
      moduleNumber: m.moduleNumber,
      titleMn: m.titleMn,
      summaryMn: m.summaryMn,
      durationMin: m.durationMin,
      keyPoints: safeJson<string[]>(m.keyPoints, []),
      status: progressMap[m.id] ?? 'NOT_STARTED',
    })),
  });
}
