import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { safeJson } from '@/lib/utils';
import { PRACTICE_ELEMENTS } from '@/lib/constants';

// GET /api/practice/qr/[token] — Багш QR скан хийхэд session мэдээлэл авах
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const auth = await getSession();
  // Багш/Админ эсвэл тест горимд л харна
  const allowed = auth && (auth.role === 'INSTRUCTOR' || auth.role === 'ADMIN' || env.testMode);
  if (!allowed) return fail('Багшийн эрх шаардлагатай', 403);

  const psession = await prisma.practiceSession.findUnique({
    where: { qrToken: params.token },
    include: { user: true, school: true },
  });
  if (!psession) return fail('QR токен олдсонгүй буюу хүчингүй', 404);

  return ok({
    id: psession.id,
    qrToken: psession.qrToken,
    status: psession.status,
    student: {
      name: `${psession.user.firstName} ${psession.user.lastName ?? ''}`.trim(),
      phone: psession.user.phone,
      registerNumber: psession.user.registerNumber,
    },
    school: { name: psession.school.name },
    elementDefs: PRACTICE_ELEMENTS,
    elements: safeJson<Record<string, boolean>>(psession.elements, {}),
  });
}
