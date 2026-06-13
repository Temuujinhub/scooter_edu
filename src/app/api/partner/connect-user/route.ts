import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticatePartner } from '@/lib/partner-auth';
import { grantRewardsForCertificate } from '@/lib/services';

const schema = z.object({
  user_phone: z.string().regex(/^\d{8}$/),
  external_user_id: z.string().optional(),
});

// POST /api/partner/connect-user — Түрээсийн апп хэрэглэгчийг өөрийн платформд холбох
// Headers: { "X-API-Key": "<partner_api_key>" }
// Хэрэглэгч сертификаттай бол урамшууллыг шууд бэлэглэнэ.
export async function POST(req: NextRequest) {
  const partner = await authenticatePartner(req);
  if (!partner) {
    return Response.json({ error: 'API key буруу эсвэл байхгүй' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'user_phone (8 орон) шаардлагатай' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone: parsed.data.user_phone } });
  if (!user) {
    return Response.json({ connected: false, error: 'Хэрэглэгч олдсонгүй' }, { status: 404 });
  }

  await prisma.rentalLink.upsert({
    where: { userId_partnerId: { userId: user.id, partnerId: partner.id } },
    create: {
      userId: user.id,
      partnerId: partner.id,
      externalUserId: parsed.data.external_user_id,
      status: 'LINKED',
    },
    update: { status: 'LINKED', externalUserId: parsed.data.external_user_id ?? undefined },
  });

  // Сертификаттай бол урамшуулал
  const cert = await prisma.certificate.findFirst({ where: { userId: user.id, status: 'ACTIVE' } });
  if (cert) await grantRewardsForCertificate(user.id, cert.id);

  return Response.json({
    connected: true,
    has_certificate: !!cert,
    reward_points: cert ? partner.rewardPoints : 0,
  });
}
