import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { getCurriculumCourse } from '@/lib/services';

const schema = z.object({ packageCode: z.string() });

// POST /api/enroll — Багц сонгож сургалтад бүртгүүлэх
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const userId = session!.sub;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Багц сонгоно уу');

  const pkg = await prisma.package.findUnique({ where: { code: parsed.data.packageCode } });
  if (!pkg || !pkg.isActive) return fail('Багц олдсонгүй', 404);
  if (!pkg.enrollable) {
    return fail('Энэ багцыг шууд худалдан авах боломжгүй. Холбоо барина уу.', 400);
  }

  const course = await getCurriculumCourse();
  if (!course) return fail('Сургалт олдсонгүй', 404);

  let enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: course.id },
  });

  if (enrollment?.status === 'ACTIVE' || enrollment?.status === 'COMPLETED') {
    return ok({
      enrollment: { status: enrollment.status },
      alreadyEnrolled: true,
    });
  }

  const status = pkg.price > 0 ? 'PENDING_PAYMENT' : 'ACTIVE';
  const enrollData = {
    packageId: pkg.id,
    packageCode: pkg.code,
    includesPractice: pkg.includesPractice,
    amountPaid: pkg.price === 0 ? 0 : enrollment?.amountPaid ?? 0,
    status,
  };

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: { userId, courseId: course.id, ...enrollData },
    });
  } else {
    enrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: enrollData,
    });
  }

  return ok({
    enrollment: { status: enrollment.status },
    needPayment: pkg.price > 0,
    price: pkg.price,
    packageCode: pkg.code,
  });
}
