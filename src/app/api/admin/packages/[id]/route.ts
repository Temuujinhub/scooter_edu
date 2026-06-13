import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().int().nonnegative().optional(),
  priceLabel: z.string().optional(),
  includesPractice: z.boolean().optional(),
  practiceSessions: z.number().int().min(0).optional(),
  includesCard: z.boolean().optional(),
  enrollable: z.boolean().optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/packages/[id] — Багц засах
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const { features, ...rest } = parsed.data;
  await prisma.package.update({
    where: { id: params.id },
    data: { ...rest, ...(features ? { features: JSON.stringify(features) } : {}) },
  });
  return ok({ updated: true });
}
