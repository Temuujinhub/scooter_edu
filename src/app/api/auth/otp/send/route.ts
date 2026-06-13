import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { generateOtp } from '@/lib/utils';
import { sendOtp } from '@/lib/sms';
import { env } from '@/lib/env';

const schema = z.object({
  phone: z.string().regex(/^\d{8}$/, '8 оронтой утасны дугаар оруулна уу'),
  purpose: z.enum(['register', 'login', 'reset']).default('register'),
});

// POST /api/auth/otp/send — Утсанд OTP код илгээх
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.errors[0].message);
  }
  const { phone, purpose } = parsed.data;

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

  await prisma.otpCode.create({
    data: { phone, code, purpose, expiresAt },
  });

  await sendOtp(phone, code);

  // Тест горимд кодыг хариунд буцааж, дэлгэц дээр харуулна.
  return ok({
    sent: true,
    expiresIn: 300,
    devOtp: env.testMode ? code : undefined,
    message: env.testMode
      ? `Тест горим: код дэлгэц дээр харагдаж байна`
      : 'Баталгаажуулах код таны утсанд илгээгдлээ',
  });
}
