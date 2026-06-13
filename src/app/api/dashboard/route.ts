import { ok } from '@/lib/api';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { getJourneyState, getCurriculumCourse } from '@/lib/services';

// GET /api/dashboard — Суралцагчийн аяллын төлөв + хувийн мэдээлэл
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const [journey, user, curriculum] = await Promise.all([
    getJourneyState(session!.sub),
    getCurrentUser(),
    getCurriculumCourse(),
  ]);

  return ok({
    journey,
    curriculumId: curriculum?.id ?? null,
    user: {
      name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
      phone: user?.phone,
      ageVerified: user?.ageVerified,
      isTestUser: user?.isTestUser,
    },
  });
}
