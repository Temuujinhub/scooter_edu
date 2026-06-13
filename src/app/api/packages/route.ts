import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { safeJson } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/packages — Үнийн багцуудын жагсаалт
export async function GET() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
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
    }))
  );
}
