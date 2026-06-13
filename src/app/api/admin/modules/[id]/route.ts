import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

const updateSchema = z.object({
  titleMn: z.string().min(2).optional(),
  summaryMn: z.string().optional(),
  contentHtml: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  durationMin: z.number().int().positive().optional(),
  videoUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/modules/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const { keyPoints, ...rest } = parsed.data;
  await prisma.module.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(keyPoints ? { keyPoints: JSON.stringify(keyPoints) } : {}),
    },
  });
  return ok({ updated: true });
}

// DELETE /api/admin/modules/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await prisma.module.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
