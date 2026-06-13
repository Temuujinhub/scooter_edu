import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { checkExamEligibility } from '@/lib/services';
import { EXAM_CONFIG } from '@/lib/constants';
import { safeJson } from '@/lib/utils';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// POST /api/exam/start — Шалгалт эхлүүлэх (30 санамсаргүй асуулт)
export async function POST() {
  const { error, session } = await requireAuth();
  if (error) return error;
  const userId = session!.sub;

  const eligibility = await checkExamEligibility(userId);
  if (!eligibility.eligible) return fail(eligibility.reason, 403);

  // Үргэлжилж буй оролдлого байвал түүнийг үргэлжлүүлнэ
  const inProgress = await prisma.examAttempt.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
  });
  if (inProgress) {
    const ids = safeJson<string[]>(inProgress.questionIds, []);
    const questions = await prisma.question.findMany({ where: { id: { in: ids } } });
    const ordered = ids
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean);
    return ok({
      attemptId: inProgress.id,
      startedAt: inProgress.startedAt,
      durationMin: EXAM_CONFIG.durationMin,
      questions: ordered.map((q) => ({
        id: q!.id,
        questionMn: q!.questionMn,
        options: safeJson<{ key: string; text: string }[]>(q!.options, []).map((o) => ({
          key: o.key,
          text: o.text,
        })),
      })),
    });
  }

  // Модуль тус бүрээс санамсаргүй асуулт сонгох
  const selected: string[] = [];
  for (const [code, count] of Object.entries(EXAM_CONFIG.distribution)) {
    const pool = await prisma.question.findMany({
      where: { moduleCode: code, isActive: true },
    });
    const picked = shuffle(pool).slice(0, count);
    selected.push(...picked.map((q) => q.id));
  }

  const finalQuestionIds = shuffle(selected);
  const questions = await prisma.question.findMany({
    where: { id: { in: finalQuestionIds } },
  });

  const attemptCount = await prisma.examAttempt.count({
    where: { userId, status: { not: 'IN_PROGRESS' } },
  });

  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      attemptNumber: attemptCount + 1,
      questionIds: JSON.stringify(finalQuestionIds),
      answers: '{}',
      status: 'IN_PROGRESS',
    },
  });

  // Асуултуудыг зөв хариултгүйгээр буцаах
  const ordered = finalQuestionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);

  return ok({
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    durationMin: EXAM_CONFIG.durationMin,
    totalQuestions: finalQuestionIds.length,
    questions: ordered.map((q) => ({
      id: q!.id,
      questionMn: q!.questionMn,
      options: safeJson<{ key: string; text: string }[]>(q!.options, []).map((o) => ({
        key: o.key,
        text: o.text,
      })),
    })),
  });
}
