import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { safeJson } from '@/lib/utils';
import { PRACTICE_ELEMENTS } from '@/lib/constants';

// GET /api/instructor/sessions — Баталгаажуулах шаардлагатай дадлагууд
export async function GET() {
  const auth = await getSession();
  const allowed = auth && (auth.role === 'INSTRUCTOR' || auth.role === 'ADMIN' || env.testMode);
  if (!allowed) return fail('Багшийн эрх шаардлагатай', 403);

  const sessions = await prisma.practiceSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: true, school: true },
  });

  return ok(
    sessions.map((s) => {
      const elements = safeJson<Record<string, boolean>>(s.elements, {});
      const passed = PRACTICE_ELEMENTS.filter((e) => elements[e.code]).length;
      return {
        id: s.id,
        qrToken: s.qrToken,
        status: s.status,
        scheduledAt: s.scheduledAt,
        verifiedAt: s.verifiedAt,
        passedElements: passed,
        totalElements: PRACTICE_ELEMENTS.length,
        student: `${s.user.firstName} ${s.user.lastName ?? ''}`.trim(),
        phone: s.user.phone,
        school: s.school.name,
      };
    })
  );
}
