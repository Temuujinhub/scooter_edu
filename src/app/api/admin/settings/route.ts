import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { SETTING_DEFS, getSettings } from '@/lib/settings';

// GET /api/admin/settings — Тодорхойлолт + одоогийн утгууд
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const values = await getSettings();
  return ok({ defs: SETTING_DEFS, values });
}

const schema = z.object({ values: z.record(z.string()) });

// PATCH /api/admin/settings — Олон тохиргоог хадгалах
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Утгууд буруу');

  const validKeys = new Set(SETTING_DEFS.map((d) => d.key));
  for (const [key, value] of Object.entries(parsed.data.values)) {
    if (!validKeys.has(key)) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  return ok({ updated: true });
}
