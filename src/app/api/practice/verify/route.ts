import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { issueCertificate } from '@/lib/services';
import { PRACTICE_ELEMENTS } from '@/lib/constants';

const schema = z.object({
  qrToken: z.string(),
  elements: z.record(z.boolean()), // { A:true, B:true, ... }
});

// POST /api/practice/verify — Багш элемент бүрийг баталгаажуулна.
// Бүх элемент тэнцэхэд session дуусаж, сертификат автоматаар үүснэ.
export async function POST(req: NextRequest) {
  const auth = await getSession();
  const allowed = auth && (auth.role === 'INSTRUCTOR' || auth.role === 'ADMIN' || env.testMode);
  if (!allowed) return fail('Багшийн эрх шаардлагатай', 403);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Баталгаажуулалтын формат буруу');

  const psession = await prisma.practiceSession.findUnique({
    where: { qrToken: parsed.data.qrToken },
  });
  if (!psession) return fail('QR токен олдсонгүй', 404);
  if (psession.status === 'COMPLETED') {
    return fail('Энэ дадлага аль хэдийн баталгаажсан байна', 400);
  }

  const elements = parsed.data.elements;
  const allPassed = PRACTICE_ELEMENTS.every((e) => elements[e.code] === true);

  const updated = await prisma.practiceSession.update({
    where: { id: psession.id },
    data: {
      elements: JSON.stringify(elements),
      instructorId: auth!.role === 'INSTRUCTOR' ? auth!.sub : psession.instructorId,
      status: allPassed ? 'COMPLETED' : 'IN_PROGRESS',
      startedAt: psession.startedAt ?? new Date(),
      verifiedAt: allPassed ? new Date() : null,
    },
  });

  let certificate = null;
  if (allPassed) {
    // Сертификат автоматаар үүсгэх (+ урамшуулал бэлэглэх)
    const cert = await issueCertificate(psession.userId);
    certificate = { certNumber: cert.certNumber, status: cert.status };
  }

  return ok({
    status: updated.status,
    allPassed,
    certificate,
  });
}
