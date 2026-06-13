import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/payments — Бүх төлбөр
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
    take: 200,
  });

  return ok(
    payments.map((p) => ({
      id: p.id,
      user: `${p.user.firstName} ${p.user.lastName ?? ''}`.trim(),
      phone: p.user.phone,
      amount: p.amount,
      method: p.paymentMethod,
      status: p.status,
      description: p.description,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }))
  );
}
