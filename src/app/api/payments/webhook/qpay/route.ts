import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { completePayment } from '@/lib/services';

// POST /api/payments/webhook/qpay — QPay-ийн callback (Судалгааны 6.2)
// QPay төлбөр амжилттай болоход энэ endpoint-ийг дуудна.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // QPay payload: { payment_id, invoice_id, payment_status, sender_invoice_no }
  const senderInvoiceNo: string | undefined = body.sender_invoice_no || body.object_id;
  const invoiceId: string | undefined = body.invoice_id;
  const status: string = (body.payment_status || '').toUpperCase();

  // Манай payment-ийг олох (sender_invoice_no = payment.id)
  let payment = null;
  if (senderInvoiceNo) {
    payment = await prisma.payment.findUnique({ where: { id: senderInvoiceNo } });
  }
  if (!payment && invoiceId) {
    payment = await prisma.payment.findFirst({ where: { providerRef: invoiceId } });
  }

  if (payment && (status === 'PAID' || status === '')) {
    await completePayment(payment.id);
  }

  // QPay 200 хүлээж авдаг
  return ok({ received: true });
}
