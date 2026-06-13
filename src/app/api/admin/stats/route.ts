import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats — Админ хяналтын самбарын статистик
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalUsers,
    students,
    activeEnrollments,
    examsPassed,
    examsTotal,
    certificates,
    paidPayments,
    revenueAgg,
    partners,
    practiceCompleted,
    rentalLinks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
    prisma.examAttempt.count({ where: { status: 'PASSED' } }),
    prisma.examAttempt.count({ where: { status: { not: 'IN_PROGRESS' } } }),
    prisma.certificate.count(),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.partner.count({ where: { isActive: true } }),
    prisma.practiceSession.count({ where: { status: 'COMPLETED' } }),
    prisma.rentalLink.count({ where: { status: 'LINKED' } }),
  ]);

  const passRate = examsTotal > 0 ? Math.round((examsPassed / examsTotal) * 100) : 0;

  // Сүүлийн 7 хоногийн бүртгэл (энгийн график)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const dailyCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyCounts[d.toISOString().slice(5, 10)] = 0;
  }
  for (const u of recentUsers) {
    const key = u.createdAt.toISOString().slice(5, 10);
    if (key in dailyCounts) dailyCounts[key]++;
  }

  return ok({
    cards: {
      totalUsers,
      students,
      activeEnrollments,
      examsPassed,
      passRate,
      certificates,
      paidPayments,
      revenue: revenueAgg._sum.amount ?? 0,
      partners,
      practiceCompleted,
      rentalLinks,
    },
    signupTrend: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })),
  });
}
