import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { checkInvoice } from '@/lib/qpay';
import { completePayment } from '@/lib/services';

// GET /api/payments/[id]/status — Төлбөрийн статус шалгах
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const payment = await prisma.payment.findFirst({
    where: { id: params.id, userId: session!.sub },
  });
  if (!payment) return fail('Төлбөр олдсонгүй', 404);

  // Production-д QPay-ээс статус шалгаж, төлөгдсөн бол идэвхжүүлнэ
  if (payment.status === 'PENDING' && payment.providerRef) {
    const paid = await checkInvoice(payment.providerRef);
    if (paid) {
      await completePayment(payment.id);
      return ok({ status: 'PAID', paid: true });
    }
  }

  return ok({ status: payment.status, paid: payment.status === 'PAID' });
}
