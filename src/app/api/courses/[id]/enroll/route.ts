import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

// POST /api/courses/[id]/enroll — Курст бүртгүүлэх
// Үнэтэй курс бол PENDING_PAYMENT төлөвт орж, төлбөрийн дараа ACTIVE болно.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || !course.isActive) return fail('Курс олдсонгүй', 404);

  let enrollment = await prisma.enrollment.findFirst({
    where: { userId: session!.sub, courseId: course.id },
  });

  if (enrollment?.status === 'ACTIVE' || enrollment?.status === 'COMPLETED') {
    return ok({ enrollment: { status: enrollment.status }, alreadyEnrolled: true });
  }

  const status = course.price > 0 ? 'PENDING_PAYMENT' : 'ACTIVE';

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: { userId: session!.sub, courseId: course.id, status },
    });
  }

  return ok({
    enrollment: { status: enrollment.status },
    needPayment: course.price > 0,
    price: course.price,
    courseId: course.id,
  });
}
