import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/certificates — Бүх сертификат
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const certs = await prisma.certificate.findMany({
    orderBy: { issuedAt: 'desc' },
    include: { user: true },
  });

  return ok(
    certs.map((c) => ({
      id: c.id,
      certNumber: c.certNumber,
      ownerName: `${c.user.firstName} ${c.user.lastName ?? ''}`.trim(),
      phone: c.user.phone,
      examScore: c.examScore,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
      status: c.status,
    }))
  );
}
