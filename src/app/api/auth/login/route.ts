import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { setAuthCookie } from '@/lib/auth';

const schema = z.object({
  phone: z.string().min(4),
  password: z.string().min(1),
});

// POST /api/auth/login — Нууц үгээр нэвтрэх (Админ / Багш)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Утас ба нууц үгээ оруулна уу');

  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) {
    return fail('Хэрэглэгч олдсонгүй эсвэл нууц үгээр нэвтрэх боломжгүй', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return fail('Нууц үг буруу байна', 401);

  await setAuthCookie({
    sub: user.id,
    role: user.role,
    phone: user.phone,
    name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
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
