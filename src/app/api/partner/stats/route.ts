import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticatePartner } from '@/lib/partner-auth';

// GET /api/partner/stats — Хамтрагчийн статистик
// Headers: { "X-API-Key": "<partner_api_key>" }
export async function GET(req: NextRequest) {
  const partner = await authenticatePartner(req);
  if (!partner) {
    return Response.json({ error: 'API key буруу эсвэл байхгүй' }, { status: 401 });
  }

  const linkedUsers = await prisma.rentalLink.count({
    where: { partnerId: partner.id, status: 'LINKED' },
  });
  const rewardsAgg = await prisma.rewardPoint.aggregate({
    where: { partnerId: partner.id },
    _sum: { points: true },
    _count: true,
  });

  return Response.json({
    partner: partner.name,
    code: partner.code,
    linked_users: linkedUsers,
    total_rewards_granted: rewardsAgg._count,
    total_points: rewardsAgg._sum.points ?? 0,
  });
}
