import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail } from '@/lib/api';
import { verifyAge } from '@/lib/xyp';

const schema = z.object({
  registerNumber: z.string().min(10, 'Регистрийн дугаар буруу'),
});

// POST /api/xyp/verify — Хур (XYP) системээс нас баталгаажуулах
// Регистрийн дугаараар иргэний мэдээлэл татаж 18+ эсэхийг шалгана.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.errors[0].message);

  const result = await verifyAge(parsed.data.registerNumber);

  return ok({
    verified: result.verified,
    age: result.age,
    message: result.message,
    citizen: result.verified
      ? {
          firstName: result.citizen.firstName,
          lastName: result.citizen.lastName,
          birthDate: result.citizen.birthDate,
          gender: result.citizen.gender,
          source: result.citizen.source,
        }
      : null,
  });
}
