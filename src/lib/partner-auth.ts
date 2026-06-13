import { NextRequest } from 'next/server';
import { prisma } from './prisma';

// X-API-Key толгойгоор хамтрагчийг танина
export async function authenticatePartner(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return null;
  const partner = await prisma.partner.findUnique({ where: { apiKey } });
  if (!partner || !partner.isActive) return null;
  return partner;
}
