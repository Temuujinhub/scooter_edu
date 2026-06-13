import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { safeJson } from '@/lib/utils';

// GET /api/admin/packages — Бүх багц (засварлахад)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const packages = await prisma.package.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { enrollments: true } } },
  });

  return ok(
    packages.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      price: p.price,
      priceLabel: p.priceLabel,
      tier: p.tier,
      includesPractice: p.includesPractice,
      practiceSessions: p.practiceSessions,
      includesCard: p.includesCard,
      enrollable: p.enrollable,
      badge: p.badge,
      description: p.description,
      features: safeJson<string[]>(p.features, []),
      isActive: p.isActive,
      enrollments: p._count.enrollments,
    }))
  );
}
