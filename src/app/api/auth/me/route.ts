import { getCurrentUser } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

// GET /api/auth/me — Одоогийн нэвтэрсэн хэрэглэгч
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail('Нэвтрээгүй байна', 401);

  return ok({
    id: user.id,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    registerNumber: user.registerNumber,
    ageVerified: user.ageVerified,
    xypVerified: user.xypVerified,
    isTestUser: user.isTestUser,
  });
}
