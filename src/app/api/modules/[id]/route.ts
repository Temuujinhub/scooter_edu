import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { safeJson } from '@/lib/utils';

// GET /api/modules/[id] — Модулийн агуулга + богино шалгалт (3 асуулт)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      questions: { where: { isActive: true }, take: 3 },
      course: true,
    },
  });
  if (!module) return fail('Модуль олдсонгүй', 404);

  const session = await getSession();
  let progress = null;
  if (session) {
    progress = await prisma.moduleProgress.findFirst({
      where: { userId: session.sub, moduleId: module.id },
    });
  }

  return ok({
    id: module.id,
    courseId: module.courseId,
    moduleNumber: module.moduleNumber,
    titleMn: module.titleMn,
    summaryMn: module.summaryMn,
    contentHtml: module.contentHtml,
    keyPoints: safeJson<string[]>(module.keyPoints, []),
    durationMin: module.durationMin,
    videoUrl: module.videoUrl,
    status: progress?.status ?? 'NOT_STARTED',
    quiz: module.questions.map((q) => ({
      id: q.id,
      questionMn: q.questionMn,
      options: safeJson<{ key: string; text: string; isCorrect: boolean }[]>(q.options, []),
      explanationMn: q.explanationMn,
    })),
  });
}
