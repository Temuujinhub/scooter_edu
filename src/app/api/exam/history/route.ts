import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// GET /api/exam/history — Шалгалтын оролдлогын түүх
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: session!.sub, status: { not: 'IN_PROGRESS' } },
    orderBy: { startedAt: 'desc' },
  });

  return ok(
    attempts.map((a) => ({
      attemptNumber: a.attemptNumber,
      score: a.score,
      percent: a.percent,
      status: a.status,
      submittedAt: a.submittedAt,
    }))
  );
}
