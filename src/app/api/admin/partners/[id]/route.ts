import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { randomToken } from '@/lib/utils';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  appName: z.string().optional(),
  rewardPoints: z.number().int().nonnegative().optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  logoColor: z.string().optional(),
  scooterCount: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  regenerateApiKey: z.boolean().optional(),
});

// PATCH /api/admin/partners/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const { regenerateApiKey, ...rest } = parsed.data;
  await prisma.partner.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(regenerateApiKey ? { apiKey: `pk_live_${randomToken(28)}` } : {}),
    },
  });
  return ok({ updated: true });
}

// DELETE /api/admin/partners/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await prisma.partner.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
