import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { safeJson } from '@/lib/utils';

// GET /api/admin/questions?moduleCode= — Асуултын сан
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const moduleCode = req.nextUrl.searchParams.get('moduleCode') ?? undefined;
  const questions = await prisma.question.findMany({
    where: moduleCode ? { moduleCode } : undefined,
    orderBy: { moduleCode: 'asc' },
    include: { module: true },
  });

  return ok(
    questions.map((q) => ({
      id: q.id,
      moduleId: q.moduleId,
      moduleCode: q.moduleCode,
      moduleTitle: q.module.titleMn,
      questionMn: q.questionMn,
      options: safeJson<{ key: string; text: string; isCorrect: boolean }[]>(q.options, []),
      explanationMn: q.explanationMn,
      difficulty: q.difficulty,
      isActive: q.isActive,
    }))
  );
}

const optionSchema = z.object({
  key: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});
const createSchema = z.object({
  moduleId: z.string(),
  questionMn: z.string().min(3),
  options: z.array(optionSchema).min(2),
  explanationMn: z.string().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
});

// POST /api/admin/questions — Шинэ асуулт
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  if (!parsed.data.options.some((o) => o.isCorrect)) {
    return fail('Дор хаяж нэг зөв хариулт сонгоно уу');
  }

  const module = await prisma.module.findUnique({ where: { id: parsed.data.moduleId } });
  if (!module) return fail('Модуль олдсонгүй', 404);

  const moduleCode = `M${module.moduleNumber}`;
  const q = await prisma.question.create({
    data: {
      moduleId: module.id,
      moduleCode,
      questionMn: parsed.data.questionMn,
      options: JSON.stringify(parsed.data.options),
      explanationMn: parsed.data.explanationMn,
      difficulty: parsed.data.difficulty,
    },
  });
  return ok({ id: q.id });
}
