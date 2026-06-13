import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({
  status: z.enum(['ACTIVE', 'REVOKED', 'EXPIRED']),
});

// PATCH /api/admin/certificates/[id] — Сертификатын статус (цуцлах/сэргээх)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Статус буруу');

  await prisma.certificate.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return ok({ updated: true });
}
