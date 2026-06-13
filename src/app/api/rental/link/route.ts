import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { grantRewardsForCertificate } from '@/lib/services';

const schema = z.object({
  partnerId: z.string(),
  externalUserId: z.string().optional(), // тухайн апп дахь хэрэглэгчийн ID/утас
});

// POST /api/rental/link — Түрээсийн аппыг хэрэглэгчийн бүртгэлд холбох
// Хэрэв хэрэглэгч аль хэдийн сертификаттай бол урамшууллыг шууд бэлэглэнэ.
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const userId = session!.sub;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Хамтрагч сонгоно уу');

  const partner = await prisma.partner.findUnique({ where: { id: parsed.data.partnerId } });
  if (!partner || !partner.isActive) return fail('Хамтрагч олдсонгүй', 404);

  const link = await prisma.rentalLink.upsert({
    where: { userId_partnerId: { userId, partnerId: partner.id } },
    create: {
      userId,
      partnerId: partner.id,
      externalUserId: parsed.data.externalUserId,
      status: 'LINKED',
    },
    update: {
      status: 'LINKED',
      externalUserId: parsed.data.externalUserId ?? undefined,
    },
  });

  // Сертификаттай бол урамшуулал бэлэглэх
  const cert = await prisma.certificate.findFirst({
    where: { userId, status: 'ACTIVE' },
  });
  if (cert) {
    await grantRewardsForCertificate(userId, cert.id);
  }

  return ok({
    linked: true,
    partner: { name: partner.name, appName: partner.appName, rewardPoints: partner.rewardPoints },
    rewardGranted: !!cert,
    message: cert
      ? `${partner.name} холбогдож, ${partner.rewardPoints} оноо бэлэглэгдлээ!`
      : `${partner.name} холбогдлоо. Сертификат авмагц урамшуулал бэлэглэгдэнэ.`,
  });
}

// DELETE /api/rental/link — Холболтыг салгах
export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Хамтрагч сонгоно уу');

  await prisma.rentalLink.updateMany({
    where: { userId: session!.sub, partnerId: parsed.data.partnerId },
    data: { status: 'UNLINKED' },
  });

  return ok({ unlinked: true });
}
