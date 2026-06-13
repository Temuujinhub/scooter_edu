import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/reports — Орлого ба хэрэглэгчийн тайлан
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Орлого — сараар
  const payments = await prisma.payment.findMany({
    where: { status: 'PAID' },
    select: { amount: true, paidAt: true },
  });
  const monthly: Record<string, number> = {};
  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = p.paidAt.toISOString().slice(0, 7); // YYYY-MM
    monthly[key] = (monthly[key] ?? 0) + p.amount;
  }

  // Курсээр бүртгэл
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } },
  });

  // Хамтрагчийн оноо
  const partners = await prisma.partner.findMany({
    include: { _count: { select: { rentalLinks: true, rewards: true } } },
  });

  // Шалгалтын статистик
  const examTotal = await prisma.examAttempt.count({ where: { status: { not: 'IN_PROGRESS' } } });
  const examPassed = await prisma.examAttempt.count({ where: { status: 'PASSED' } });

  return ok({
    revenueByMonth: Object.entries(monthly)
      .sort()
      .map(([month, amount]) => ({ month, amount })),
    totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
    courseEnrollments: courses.map((c) => ({
      title: c.titleMn,
      code: c.code,
      enrollments: c._count.enrollments,
    })),
    partnerStats: partners.map((p) => ({
      name: p.name,
      code: p.code,
      linkedUsers: p._count.rentalLinks,
      rewardsGranted: p._count.rewards,
    })),
    exam: { total: examTotal, passed: examPassed, failed: examTotal - examPassed },
  });
}
