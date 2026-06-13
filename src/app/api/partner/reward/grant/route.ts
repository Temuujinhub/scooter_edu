import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticatePartner } from '@/lib/partner-auth';

const schema = z.object({
  cert_number: z.string().optional(),
  user_phone: z.string().optional(),
  points: z.number().int().positive().optional(),
  action: z.string().default('training_completed'),
});

// POST /api/partner/reward/grant — Хамтрагч урамшуулал бэлэглэх (Судалгааны 5.5)
// Headers: { "X-API-Key": "<partner_api_key>" }
export async function POST(req: NextRequest) {
  const partner = await authenticatePartner(req);
  if (!partner) {
    return Response.json({ error: 'API key буруу эсвэл байхгүй' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.cert_number && !parsed.data.user_phone)) {
    return Response.json(
      { error: 'cert_number эсвэл user_phone шаардлагатай' },
      { status: 400 }
    );
  }

  // Хэрэглэгчийг олох
  let userId: string | null = null;
  let certificateId: string | null = null;

  if (parsed.data.cert_number) {
    const cert = await prisma.certificate.findUnique({
      where: { certNumber: parsed.data.cert_number },
    });
    if (cert) {
      userId = cert.userId;
      certificateId = cert.id;
    }
  }
  if (!userId && parsed.data.user_phone) {
    const user = await prisma.user.findUnique({ where: { phone: parsed.data.user_phone } });
    if (user) userId = user.id;
  }

  if (!userId) {
    return Response.json({ granted: false, error: 'Хэрэглэгч олдсонгүй' }, { status: 404 });
  }

  const points = parsed.data.points ?? partner.rewardPoints;
  await prisma.rewardPoint.create({
    data: {
      userId,
      partnerId: partner.id,
      certificateId,
      points,
      actionType: parsed.data.action,
    },
  });

  return Response.json({ granted: true, points, partner: partner.code });
}
