import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { createInvoice } from '@/lib/qpay';
import { env } from '@/lib/env';
import { getCurriculumCourse } from '@/lib/services';

const schema = z.object({
  packageCode: z.string(),
});

// POST /api/payments/qpay/init — QPay invoice үүсгэх (багцаар)
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Багц сонгоно уу');

  const pkg = await prisma.package.findUnique({ where: { code: parsed.data.packageCode } });
  if (!pkg || !pkg.enrollable) return fail('Багц олдсонгүй', 404);
  if (pkg.price <= 0) return fail('Энэ багц төлбөргүй / холбоо барих', 400);

  const course = await getCurriculumCourse();
  if (!course) return fail('Сургалт олдсонгүй', 404);

  // Бүртгэл байгаа эсэхийг шалгах
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session!.sub, courseId: course.id },
  });
  if (enrollment?.status === 'ACTIVE' || enrollment?.status === 'COMPLETED') {
    return fail('Та аль хэдийн бүртгэлтэй байна', 400);
  }

  // Төлбөрийн бичлэг
  const payment = await prisma.payment.create({
    data: {
      userId: session!.sub,
      courseId: course.id,
      amount: pkg.price,
      paymentMethod: 'QPAY',
      status: 'PENDING',
      description: `${pkg.name} багц — сургалтын төлбөр`,
    },
  });

  const invoice = await createInvoice({
    amount: pkg.price,
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
    amount: pkg.price,
    invoiceId: invoice.invoiceId,
    qrText: invoice.qrText,
    shortUrl: invoice.shortUrl,
    isMock: invoice.isMock,
    canSimulate: env.testMode,
  });
}
