import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

const updateSchema = z.object({
  titleMn: z.string().min(2).optional(),
  descriptionMn: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
  durationHours: z.number().positive().optional(),
  level: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// PATCH /api/admin/courses/[id] — Курс засах
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  await prisma.course.update({ where: { id: params.id }, data: parsed.data });
  return ok({ updated: true });
}

// DELETE /api/admin/courses/[id] — Курс устгах
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await prisma.course.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
