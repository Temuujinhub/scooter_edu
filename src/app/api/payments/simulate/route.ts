import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { env } from '@/lib/env';
import { completePayment } from '@/lib/services';

const schema = z.object({ paymentId: z.string() });

// POST /api/payments/simulate — ТЕСТ ГОРИМ: төлбөрийг гараар амжилттай болгох
// ("Төлбөр баталгаажуулах (симуляци)" товч)
export async function POST(req: NextRequest) {
  if (!env.testMode) return fail('Симуляци идэвхгүй (production)', 403);

  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('paymentId шаардлагатай');

  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, userId: session!.sub },
  });
  if (!payment) return fail('Төлбөр олдсонгүй', 404);

  await completePayment(payment.id);

  return ok({ status: 'PAID', paid: true, message: 'Төлбөр амжилттай (симуляци)' });
}
