import { ok } from '@/lib/api';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { getJourneyState } from '@/lib/services';

// GET /api/dashboard — Суралцагчийн аяллын төлөв + хувийн мэдээлэл
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const [journey, user] = await Promise.all([
    getJourneyState(session!.sub),
    getCurrentUser(),
  ]);

  return ok({
    journey,
    user: {
      name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
      phone: user?.phone,
      ageVerified: user?.ageVerified,
      isTestUser: user?.isTestUser,
    },
  });
}
