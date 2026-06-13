import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// GET /api/rental/links — Миний холбосон түрээсийн аппууд + урамшууллын оноо
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;
  const userId = session!.sub;

  const links = await prisma.rentalLink.findMany({
    where: { userId },
    include: { partner: true },
    orderBy: { linkedAt: 'desc' },
  });

  // Нийт цуглуулсан оноо (хамтрагчаар)
  const rewards = await prisma.rewardPoint.groupBy({
    by: ['partnerId'],
    where: { userId },
    _sum: { points: true },
  });
  const rewardMap = Object.fromEntries(
    rewards.map((r) => [r.partnerId, r._sum.points ?? 0])
  );

  return ok(
    links.map((l) => ({
      partnerId: l.partnerId,
      partnerName: l.partner.name,
      appName: l.partner.appName,
      logoColor: l.partner.logoColor,
      status: l.status,
      rewardGranted: l.rewardGranted,
      points: rewardMap[l.partnerId] ?? 0,
      linkedAt: l.linkedAt,
    }))
  );
}
