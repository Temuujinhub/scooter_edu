import { ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { checkExamEligibility } from '@/lib/services';
import { EXAM_CONFIG } from '@/lib/constants';

// GET /api/exam/eligibility — Шалгалт өгөх эрхтэй эсэхийг шалгах
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const result = await checkExamEligibility(session!.sub);
  return ok({ ...result, config: EXAM_CONFIG });
}
