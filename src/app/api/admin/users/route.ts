import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users — Хэрэглэгчийн жагсаалт
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { enrollments: true, certificates: true, examAttempts: true } },
    },
  });

  return ok(
    users.map((u) => ({
      id: u.id,
      phone: u.phone,
      registerNumber: u.registerNumber,
      name: `${u.firstName} ${u.lastName ?? ''}`.trim(),
      role: u.role,
      ageVerified: u.ageVerified,
      xypVerified: u.xypVerified,
      isTestUser: u.isTestUser,
      enrollments: u._count.enrollments,
      certificates: u._count.certificates,
      examAttempts: u._count.examAttempts,
      createdAt: u.createdAt,
    }))
  );
}
