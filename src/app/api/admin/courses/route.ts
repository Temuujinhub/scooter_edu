import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/courses — Бүх курс (идэвхгүйг оруулаад)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const courses = await prisma.course.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return ok(
    courses.map((c) => ({
      id: c.id,
      code: c.code,
      titleMn: c.titleMn,
      descriptionMn: c.descriptionMn,
      price: c.price,
      durationHours: c.durationHours,
      level: c.level,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments,
    }))
  );
}

const createSchema = z.object({
  code: z.string().min(2),
  titleMn: z.string().min(2),
  descriptionMn: z.string().default(''),
  price: z.number().int().nonnegative(),
  durationHours: z.number().positive(),
  level: z.string().default('Анхан шат'),
  isActive: z.boolean().default(true),
});

// POST /api/admin/courses — Шинэ курс үүсгэх
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const exists = await prisma.course.findUnique({ where: { code: parsed.data.code } });
  if (exists) return fail('Энэ код бүхий курс аль хэдийн байна', 409);

  const count = await prisma.course.count();
  const course = await prisma.course.create({
    data: { ...parsed.data, sortOrder: count + 1, coverImage: '/images/course-cover.svg' },
  });

  return ok({ id: course.id });
}
