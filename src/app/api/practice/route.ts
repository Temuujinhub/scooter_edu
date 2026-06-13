import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { safeJson } from '@/lib/utils';
import { PRACTICE_ELEMENTS } from '@/lib/constants';

// GET /api/practice — Миний практик дадлагын session-ууд
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: 'desc' },
    include: { school: true },
  });

  return ok({
    elements: PRACTICE_ELEMENTS,
    sessions: sessions.map((s) => ({
      id: s.id,
      qrToken: s.qrToken,
      status: s.status,
      scheduledAt: s.scheduledAt,
      verifiedAt: s.verifiedAt,
      elements: safeJson<Record<string, boolean>>(s.elements, {}),
      school: { name: s.school.name, address: s.school.address },
    })),
  });
}
