import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { env } from '@/lib/env';

// GET /api/certificates — Миний дижитал сертификатууд
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const certs = await prisma.certificate.findMany({
    where: { userId: session!.sub },
    orderBy: { issuedAt: 'desc' },
    include: { user: true },
  });

  return ok(
    certs.map((c) => ({
      id: c.id,
      certNumber: c.certNumber,
      ownerName: `${c.user.firstName} ${c.user.lastName ?? ''}`.trim(),
      registerNumber: c.user.registerNumber,
      examScore: c.examScore,
      practiceVerified: c.practiceVerified,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
      status: c.status,
      hash: c.hash,
      verifyUrl: `${env.appUrl}/verify/${c.certNumber}`,
    }))
  );
}
