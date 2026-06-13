import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { setAuthCookie } from '@/lib/auth';
import { verifyAge } from '@/lib/xyp';

const schema = z.object({
  phone: z.string().regex(/^\d{8}$/, '8 оронтой утасны дугаар'),
  code: z.string().regex(/^\d{6}$/, '6 оронтой код'),
  registerNumber: z.string().optional(),
});

// POST /api/auth/register — Утас + OTP-ээр бүртгэх/нэвтрэх
// Шинэ хэрэглэгчид: регистрээр Хур(XYP)-аас мэдээлэл татаж 18+ нас шалгана.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const { phone, code, registerNumber } = parsed.data;

  // OTP шалгах
  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, verified: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) {
    return fail('Баталгаажуулах код буруу эсвэл хугацаа дууссан байна', 400);
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { verified: true } });

  // Хэрэглэгч аль хэдийн байгаа эсэх → нэвтрэх
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    // Шинэ бүртгэл — регистр заавал
    if (!registerNumber) {
      return fail('Шинэ бүртгэлд регистрийн дугаар шаардлагатай', 400, {
        needRegister: true,
      });
    }

    // Хур (XYP) системээс нас баталгаажуулах
    const ageCheck = await verifyAge(registerNumber);
    if (!ageCheck.verified) {
      return fail(ageCheck.message, 403, { ageError: true, age: ageCheck.age });
    }

    // Регистр давхцаж байгаа эсэх
    const dup = await prisma.user.findUnique({
      where: { registerNumber: registerNumber.toUpperCase() },
    });
    if (dup) return fail('Энэ регистрээр бүртгэл аль хэдийн үүссэн байна', 409);

    user = await prisma.user.create({
      data: {
        phone,
        registerNumber: registerNumber.toUpperCase(),
        firstName: ageCheck.citizen.firstName || 'Хэрэглэгч',
        lastName: ageCheck.citizen.lastName || null,
        birthDate: ageCheck.citizen.birthDate ? new Date(ageCheck.citizen.birthDate) : null,
        gender: ageCheck.citizen.gender,
        role: 'STUDENT',
        ageVerified: true,
        xypVerified: ageCheck.citizen.source === 'xyp',
      },
    });
  }

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
    isNew: !registerNumber ? false : true,
  });
}
