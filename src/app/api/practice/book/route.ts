import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { randomToken } from '@/lib/utils';

const schema = z.object({
  schoolId: z.string(),
  scheduledAt: z.string(), // ISO огноо
});

// POST /api/practice/book — Практик дадлага захиалах (QR токен үүснэ)
// Урьдчилсан нөхцөл: онлайн шалгалтад тэнцсэн байх.
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const userId = session!.sub;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Жолооны курс ба огноогоо сонгоно уу');

  // Багц практик дадлага агуулдаг эсэх
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'COMPLETED'] } },
  });
  if (enrollment && !enrollment.includesPractice) {
    return fail(
      'Таны багц практик дадлага агуулаагүй байна. Стандарт/Pro багц руу шинэчилнэ үү.',
      403
    );
  }

  // Шалгалтад тэнцсэн эсэх
  const passed = await prisma.examAttempt.findFirst({
    where: { userId, status: 'PASSED' },
  });
  if (!passed) {
    return fail('Эхлээд онлайн шалгалтад тэнцсэн байх шаардлагатай', 403);
  }

  const school = await prisma.drivingSchool.findUnique({
    where: { id: parsed.data.schoolId },
  });
  if (!school) return fail('Жолооны курс олдсонгүй', 404);

  // Идэвхтэй (дуусаагүй) захиалга байгаа эсэх
  const active = await prisma.practiceSession.findFirst({
    where: { userId, status: { in: ['BOOKED', 'IN_PROGRESS'] } },
  });
  if (active) {
    return ok({
      session: { id: active.id, qrToken: active.qrToken, status: active.status },
      alreadyBooked: true,
    });
  }

  const psession = await prisma.practiceSession.create({
    data: {
      userId,
      schoolId: school.id,
      qrToken: randomToken(20),
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: 'BOOKED',
      elements: '{}',
    },
  });

  return ok({
    session: {
      id: psession.id,
      qrToken: psession.qrToken,
      status: psession.status,
      scheduledAt: psession.scheduledAt,
    },
  });
}
