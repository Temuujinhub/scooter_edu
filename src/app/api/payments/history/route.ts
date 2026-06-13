import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// GET /api/payments/history — Төлбөрийн түүх
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const payments = await prisma.payment.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: 'desc' },
  });

  return ok(
    payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      method: p.paymentMethod,
      status: p.status,
      description: p.description,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }))
  );
}
