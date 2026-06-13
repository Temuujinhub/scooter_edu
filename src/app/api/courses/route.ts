import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';

// GET /api/courses — Идэвхтэй курсуудын жагсаалт
export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { modules: true } } },
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
      coverImage: c.coverImage,
      moduleCount: c._count.modules,
    }))
  );
}
