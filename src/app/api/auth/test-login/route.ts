import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { setAuthCookie } from '@/lib/auth';
import { env } from '@/lib/env';

// POST /api/auth/test-login — ТЕСТ ГОРИМЫН ХЯЛБАР БҮРТГЭЛ
// Утас, OTP, регистр шаардахгүйгээр шууд тест суралцагч үүсгэж нэвтэрнэ.
// (Зөвхөн TEST_MODE=true үед ажиллана)
export async function POST(req: NextRequest) {
  if (!env.testMode) {
    return fail('Тест нэвтрэлт идэвхгүй (production)', 403);
  }

  const body = await req.json().catch(() => ({}));
  const name: string = (body?.name || '').trim() || 'Тест Хэрэглэгч';
  let phone: string = (body?.phone || '').trim();

  // Утас өгөөгүй бол санамсаргүй үүсгэнэ
  if (!/^\d{8}$/.test(phone)) {
    phone = '7' + Math.floor(1000000 + Math.random() * 8999999).toString();
  }

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    const [firstName, ...rest] = name.split(' ');
    user = await prisma.user.create({
      data: {
        phone,
        firstName: firstName || 'Тест',
        lastName: rest.join(' ') || 'Хэрэглэгч',
        role: 'STUDENT',
        ageVerified: true, // тестэд нас шалгахыг алгасна
        isTestUser: true,
        birthDate: new Date('2000-01-01'),
      },
    });
  }

  await setAuthCookie({
    sub: user.id,
    role: user.role,
    phone: user.phone,
    name: `${user.firstName} ${user.lastName ?? ''}`.trim(),
  });

  return ok({
    user: {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
}
