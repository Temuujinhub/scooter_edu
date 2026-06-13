import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { EXAM_CONFIG } from '@/lib/constants';
import { safeJson } from '@/lib/utils';

const schema = z.object({
  attemptId: z.string(),
  answers: z.record(z.string()), // { questionId: selectedKey }
  autoSubmit: z.boolean().optional(), // anti-cheat / таймер дуусахад
});

// POST /api/exam/submit — Шалгалт дуусгаж оноо тооцох
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Хариултын формат буруу');

  const { attemptId, answers } = parsed.data;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId: session!.sub },
  });
  if (!attempt) return fail('Оролдлого олдсонгүй', 404);
  if (attempt.status !== 'IN_PROGRESS') {
    return fail('Энэ шалгалт аль хэдийн дууссан байна', 400);
  }

  const questionIds = safeJson<string[]>(attempt.questionIds, []);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });

  // Оноо тооцох
  let correct = 0;
  const review = questions.map((q) => {
    const opts = safeJson<{ key: string; text: string; isCorrect: boolean }[]>(q.options, []);
    const correctKey = opts.find((o) => o.isCorrect)?.key;
    const userKey = answers[q.id];
    const isRight = userKey === correctKey;
    if (isRight) correct++;
    return {
      questionMn: q.questionMn,
      correctKey,
      userKey: userKey ?? null,
      isRight,
      explanationMn: q.explanationMn,
    };
  });

  const total = questionIds.length;
  const percent = Math.round((correct / total) * 100);
  const passed = correct >= EXAM_CONFIG.passScore;

  // Дараагийн оролдлогын цаг (тэнцээгүй бол)
  let nextAttemptAt: Date | null = null;
  if (!passed) {
    const finishedCount = await prisma.examAttempt.count({
      where: { userId: session!.sub, status: { not: 'IN_PROGRESS' } },
    });
    const hours =
      finishedCount + 1 >= EXAM_CONFIG.maxAttempts
        ? EXAM_CONFIG.lockoutHours
        : EXAM_CONFIG.retryDelayHours;
    nextAttemptAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      answers: JSON.stringify(answers),
      score: correct,
      percent,
      status: passed ? 'PASSED' : 'FAILED',
      submittedAt: new Date(),
      nextAttemptAt,
    },
  });

  return ok({
    passed,
    score: correct,
    total,
    percent,
    passScore: EXAM_CONFIG.passScore,
    nextAttemptAt,
    review,
  });
}
