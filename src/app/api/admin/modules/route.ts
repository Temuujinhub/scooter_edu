import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { safeJson } from '@/lib/utils';

// GET /api/admin/modules?courseId= — Модулиуд
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const courseId = req.nextUrl.searchParams.get('courseId') ?? undefined;
  const modules = await prisma.module.findMany({
    where: courseId ? { courseId } : undefined,
    orderBy: [{ courseId: 'asc' }, { sortOrder: 'asc' }],
    include: { _count: { select: { questions: true } }, course: true },
  });

  return ok(
    modules.map((m) => ({
      id: m.id,
      courseId: m.courseId,
      courseTitle: m.course.titleMn,
      moduleNumber: m.moduleNumber,
      titleMn: m.titleMn,
      summaryMn: m.summaryMn,
      contentHtml: m.contentHtml,
      keyPoints: safeJson<string[]>(m.keyPoints, []),
      durationMin: m.durationMin,
      videoUrl: m.videoUrl,
      isActive: m.isActive,
      questionCount: m._count.questions,
    }))
  );
}

const createSchema = z.object({
  courseId: z.string(),
  moduleNumber: z.number().int().positive(),
  titleMn: z.string().min(2),
  summaryMn: z.string().default(''),
  contentHtml: z.string().default(''),
  keyPoints: z.array(z.string()).default([]),
  durationMin: z.number().int().positive().default(15),
  videoUrl: z.string().optional(),
});

// POST /api/admin/modules — Шинэ модуль
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const m = await prisma.module.create({
    data: {
      courseId: parsed.data.courseId,
      moduleNumber: parsed.data.moduleNumber,
      titleMn: parsed.data.titleMn,
      summaryMn: parsed.data.summaryMn,
      contentHtml: parsed.data.contentHtml,
      keyPoints: JSON.stringify(parsed.data.keyPoints),
      durationMin: parsed.data.durationMin,
      videoUrl: parsed.data.videoUrl ?? null,
      sortOrder: parsed.data.moduleNumber,
    },
  });
  return ok({ id: m.id });
}
