import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

const updateSchema = z.object({
  questionMn: z.string().min(3).optional(),
  options: z
    .array(z.object({ key: z.string(), text: z.string(), isCorrect: z.boolean() }))
    .optional(),
  explanationMn: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/questions/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const { options, ...rest } = parsed.data;
  await prisma.question.update({
    where: { id: params.id },
    data: { ...rest, ...(options ? { options: JSON.stringify(options) } : {}) },
  });
  return ok({ updated: true });
}

// DELETE /api/admin/questions/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await prisma.question.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
