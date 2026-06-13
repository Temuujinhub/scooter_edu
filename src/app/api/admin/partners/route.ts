import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { randomToken } from '@/lib/utils';

// GET /api/admin/partners — Хамтрагч компаниуд (API key-тэйгээ)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { rentalLinks: true, rewards: true } } },
  });

  return ok(
    partners.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      appName: p.appName,
      apiKey: p.apiKey,
      rewardPoints: p.rewardPoints,
      discountPercent: p.discountPercent,
      logoColor: p.logoColor,
      scooterCount: p.scooterCount,
      description: p.description,
      isActive: p.isActive,
      linkedUsers: p._count.rentalLinks,
      rewardsGranted: p._count.rewards,
    }))
  );
}

const createSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  appName: z.string().min(1),
  rewardPoints: z.number().int().nonnegative().default(500),
  discountPercent: z.number().int().min(0).max(100).default(0),
  logoColor: z.string().default('#1B448A'),
  scooterCount: z.string().default(''),
  description: z.string().default(''),
});

// POST /api/admin/partners — Шинэ хамтрагч (API key автоматаар үүснэ)
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const exists = await prisma.partner.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  });
  if (exists) return fail('Энэ код бүхий хамтрагч аль хэдийн байна', 409);

  const partner = await prisma.partner.create({
    data: { ...parsed.data, code: parsed.data.code.toUpperCase(), apiKey: `pk_live_${randomToken(28)}` },
  });
  return ok({ id: partner.id, apiKey: partner.apiKey });
}
