import { clearAuthCookie } from '@/lib/auth';
import { ok } from '@/lib/api';

// POST /api/auth/logout
export async function POST() {
  clearAuthCookie();
  return ok({ loggedOut: true });
}
