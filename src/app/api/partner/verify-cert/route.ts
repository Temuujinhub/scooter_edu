import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticatePartner } from '@/lib/partner-auth';

const schema = z.object({ cert_number: z.string() });

// POST /api/partner/verify-cert — Хамтрагч компани сертификат шалгах (Судалгааны 6.3)
// Headers: { "X-API-Key": "<partner_api_key>" }
// Тэмдэглэл: гадаад API стандартын дагуу цэвэр JSON (success wrapper-гүй) буцаана.
export async function POST(req: NextRequest) {
  const partner = await authenticatePartner(req);
  if (!partner) {
    return Response.json({ error: 'API key буруу эсвэл байхгүй' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'cert_number шаардлагатай' }, { status: 400 });
  }

  const cert = await prisma.certificate.findUnique({
    where: { certNumber: parsed.data.cert_number },
    include: { user: true },
  });

  if (!cert) {
    return Response.json({ valid: false, reason: 'not_found' });
  }

  const expired = cert.expiresAt < new Date();
  const valid = cert.status === 'ACTIVE' && !expired;

  return Response.json({
    valid,
    reason: valid ? 'active' : expired ? 'expired' : 'revoked',
    cert_number: cert.certNumber,
    owner_name: `${cert.user.firstName.charAt(0)}.${cert.user.lastName ?? cert.user.firstName}`,
    issued_at: cert.issuedAt.toISOString().slice(0, 10),
    expires_at: cert.expiresAt.toISOString().slice(0, 10),
    status: cert.status.toLowerCase(),
  });
}
