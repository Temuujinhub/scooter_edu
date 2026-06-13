import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';

// GET /api/certificates/verify/[number] — Сертификатын нийтийн шалгалт
// (Хэн ч QR скан хийж шалгаж болно — Судалгааны 10.3)
export async function GET(req: NextRequest, { params }: { params: { number: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { certNumber: params.number },
    include: { user: true },
  });

  if (!cert) {
    return ok({ valid: false, reason: 'not_found', message: 'Гэрчилгээ олдсонгүй' });
  }

  const expired = cert.expiresAt < new Date();
  const valid = cert.status === 'ACTIVE' && !expired;

  // Нэрийг хэсэгчлэн нуух (нууцлал): "Б.Батбаяр"
  const initial = cert.user.firstName.charAt(0);
  const maskedName = `${initial}.${cert.user.lastName ?? cert.user.firstName}`;

  return ok({
    valid,
    reason: expired ? 'expired' : cert.status !== 'ACTIVE' ? 'revoked' : 'active',
    certNumber: cert.certNumber,
    owner: maskedName,
    examScore: cert.examScore ? `${cert.examScore}%` : null,
    practiceVerified: cert.practiceVerified,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    status: cert.status,
    hash: cert.hash,
  });
}
