import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { createInvoice } from '@/lib/qpay';
import { env } from '@/lib/env';

const schema = z.object({
  courseId: z.string(),
});

// POST /api/payments/qpay/init — QPay invoice үүсгэх
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Курс сонгоно уу');

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) return fail('Курс олдсонгүй', 404);

  // Бүртгэл байгаа эсэхийг шалгах
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session!.sub, courseId: course.id },
  });
  if (enrollment?.status === 'ACTIVE' || enrollment?.status === 'COMPLETED') {
    return fail('Та энэ курст аль хэдийн бүртгэлтэй байна', 400);
  }

  // Төлбөрийн бичлэг үүсгэх
  const payment = await prisma.payment.create({
    data: {
      userId: session!.sub,
      courseId: course.id,
      amount: course.price,
      paymentMethod: 'QPAY',
      status: 'PENDING',
      description: `${course.titleMn} — сургалтын төлбөр`,
    },
  });

  // QPay invoice (тестэд мок)
  const invoice = await createInvoice({
    amount: course.price,
    description: payment.description,
    senderInvoiceNo: payment.id,
    callbackUrl: `${env.appUrl}/api/payments/webhook/qpay`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerRef: invoice.invoiceId, qrText: invoice.qrText },
  });

  return ok({
    paymentId: payment.id,
    amount: course.price,
    invoiceId: invoice.invoiceId,
    qrText: invoice.qrText,
    shortUrl: invoice.shortUrl,
    isMock: invoice.isMock,
    canSimulate: env.testMode,
  });
}
