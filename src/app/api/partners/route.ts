import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';

// GET /api/partners — Хамтрагч (түрээсийн) компаниудын нийтийн жагсаалт
export async function GET() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  return ok(
    partners.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      appName: p.appName,
      rewardPoints: p.rewardPoints,
      discountPercent: p.discountPercent,
      logoColor: p.logoColor,
      scooterCount: p.scooterCount,
      description: p.description,
    }))
  );
}
