// Дижитал сертификатын дугаар ба баталгаажуулалтын hash үүсгэх.
// Формат: SCE-YYYY-NNNNNN (Судалгааны 10.2 хэсэг)

import { createHash } from 'crypto';
import { prisma } from './prisma';

// Дараагийн сертификатын дугаар үүсгэх
export async function generateCertNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SCE-${year}-`;

  const count = await prisma.certificate.count({
    where: { certNumber: { startsWith: prefix } },
  });

  const seq = (count + 1).toString().padStart(6, '0');
  return `${prefix}${seq}`;
}

// SHA-256 баталгаажуулалтын hash
export function generateCertHash(data: {
  certNumber: string;
  userId: string;
  issuedAt: Date;
  examScore: number | null;
}): string {
  const payload = `${data.certNumber}|${data.userId}|${data.issuedAt.toISOString()}|${data.examScore ?? 0}|scooteredu-mn`;
  return createHash('sha256').update(payload).digest('hex');
}
