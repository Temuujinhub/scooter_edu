import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']).default('COMPLETED'),
  watchSeconds: z.number().int().nonnegative().optional(),
  quizScore: z.number().int().min(0).max(100).optional(),
});

// POST /api/modules/[id]/progress — Модулийн явцыг шинэчлэх
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const module = await prisma.module.findUnique({ where: { id: params.id } });
  if (!module) return fail('Модуль олдсонгүй', 404);

  const { status, watchSeconds, quizScore } = parsed.data;

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId: session!.sub, moduleId: module.id } },
    create: {
      userId: session!.sub,
      moduleId: module.id,
      status,
      watchSeconds: watchSeconds ?? 0,
      quizScore: quizScore ?? null,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
    update: {
      status,
      watchSeconds: watchSeconds ?? undefined,
      quizScore: quizScore ?? undefined,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
  });

  return ok({ status: progress.status });
}
